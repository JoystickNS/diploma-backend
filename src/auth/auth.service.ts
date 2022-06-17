import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import { TokensService } from "src/tokens/tokens.service";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../classes/jwt-payload";
import { IAppRequest } from "../interfaces/app-request";
import { ExceptionMessages } from "../constants/exception-messages";
import { LoginDto } from "./dto/login.dto";
import { calcTokenLifeTime, refreshCookieOptions } from "../utils/utils";
import { PermissionsService } from "../permissions/permissions.service";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  async registration(req: IAppRequest, res: Response, dto: CreateUserDto) {
    const { login, password } = dto;
    const user = await this.usersService.getByLogin(login);

    if (user) {
      throw new BadRequestException(ExceptionMessages.LoginAlreadyUsed(login));
    }

    const hashedPassword = await bcrypt.hash(password, 7);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...newUser } = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });
    const payload = new JwtPayload(newUser);
    const generatedTokens = this.tokensService.generate(payload);
    const createdToken = await this.tokensService.create({
      refreshToken: generatedTokens.refreshToken,
      expires: calcTokenLifeTime(),
      userAgent: req.headers["user-agent"],
      userId: newUser.id,
    });

    this.setRefreshCookie(
      res,
      generatedTokens.refreshToken,
      createdToken.expires
    );

    return {
      user: {
        ...newUser,
      },
      accessToken: generatedTokens.accessToken,
    };
  }

  async login(req: IAppRequest, res: Response, dto: LoginDto) {
    // axios.post("http://208.ugtu.net/adauth.php")
    const { rememberMe } = dto;
    const userAgent = req.headers["user-agent"];
    const payload = req.user;
    const user = await this.usersService.getById(payload.id);
    delete user.password;
    const generatedTokens = this.tokensService.generate(new JwtPayload(user));
    const memorizedTokens = await this.tokensService.getAllByUserId(user.id);
    const tokenOptions = {
      refreshToken: generatedTokens.refreshToken,
      expires: rememberMe ? calcTokenLifeTime() : null,
      userAgent,
    };
    const isMaxMemorizedTokens =
      memorizedTokens.length === this.configService.get("maxMemorizedTokens");

    if (!rememberMe || !isMaxMemorizedTokens) {
      await this.tokensService.create({
        ...tokenOptions,
        userId: user.id,
      });
    } else {
      await this.tokensService.updateFirstByUserId(user.id, {
        ...tokenOptions,
      });
    }

    const permissions = await this.permissionsService.getByUserId(user.id);

    this.setRefreshCookie(
      res,
      generatedTokens.refreshToken,
      rememberMe ? calcTokenLifeTime() : null
    );

    return {
      user: {
        ...user,
        permissions: permissions,
      },
      accessToken: generatedTokens.accessToken,
    };
  }

  async me(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const token = await this.tokensService.getByRefreshToken(refreshToken);

    if (token) {
      const user = await this.usersService.getById(token.userId);
      delete user.password;
      const permissions = await this.permissionsService.getByUserId(user.id);

      return {
        ...user,
        permissions: permissions,
      };
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async refresh(req: IAppRequest, res: Response) {
    const oldRefreshToken = req.cookies["refreshToken"];

    if (!oldRefreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const userAgent = req.headers["user-agent"];

    if (oldRefreshToken) {
      const token = await this.tokensService.getByRefreshToken(oldRefreshToken);

      if (token) {
        const user = await this.usersService.getById(token.userId);
        const payload = new JwtPayload(user);
        const generatedTokens = this.tokensService.generate(payload);

        const updatedToken = await this.tokensService.update(oldRefreshToken, {
          refreshToken: generatedTokens.refreshToken,
          expires: token.expires ? calcTokenLifeTime() : null,
          userAgent,
        });

        this.setRefreshCookie(
          res,
          generatedTokens.refreshToken,
          updatedToken?.expires
        );

        return {
          accessToken: generatedTokens.accessToken,
        };
      }
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async logout(req: IAppRequest, res: Response) {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const token = await this.tokensService.getByRefreshToken(refreshToken);

    if (token) {
      await this.tokensService.delete(refreshToken);
      this.deleteRefreshCookie(res);
      return;
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async validateUser(login: string, password: string) {
    let result;

    await this.prisma.$transaction(async (prisma) => {
      // Поиск пользователя внутри системы по логину
      let user = await this.usersService.getByLogin(login);

      // Если пользователь создан внутри этой системы
      if (user && user.password) {
        const isPasswordsEqual = await bcrypt.compare(password, user.password);

        if (isPasswordsEqual) {
          result = new JwtPayload(user);
          return;
        }

        result = null;
        return;
      }

      const params = new URLSearchParams();
      params.append("user", login);
      params.append("pass", password);

      const data = await (
        await axios.post("http://208.ugtu.net/adauth.php", params)
      ).data;

      // Авторизовались успешно
      if (data.success) {
        const roles = [];
        if (data.post.toLowerCase().includes("заведующий кафедрой")) {
          roles.push("Руководитель");
        }

        // Является ли пользователь преподавателем
        if (data.ispps) {
          roles.push("Преподаватель");
        }

        // Айдишники старых ролей
        let oldRoleIds;

        // Если новых ролей нет, то удаляем старые,
        // если они были и выходим
        if (roles.length === 0) {
          if (user && oldRoleIds.length > 0) {
            // Айдишники старых ролей
            oldRoleIds = (
              await prisma.usersOnRoles.findMany({
                where: {
                  userId: user.id,
                },
              })
            ).map((oldRoleId) => oldRoleId.roleId);

            await prisma.usersOnRoles.deleteMany({
              where: {
                userId: user.id,
              },
            });
          }

          result = null;
          return;
        }

        if (user && !oldRoleIds) {
          // Айдишники старых ролей
          oldRoleIds = (
            await prisma.usersOnRoles.findMany({
              where: {
                userId: user.id,
              },
            })
          ).map((oldRoleId) => oldRoleId.roleId);
        }

        // Айдишники новых ролей
        const newRoleIds = (
          await prisma.role.findMany({
            where: {
              name: {
                in: roles,
              },
            },
            select: {
              id: true,
            },
          })
        ).map((roleId) => roleId.id);

        if (user) {
          // Удаление старых ролей, которых нет в новых ролях
          await Promise.all(
            oldRoleIds.map(async (oldRoleId) => {
              if (!newRoleIds.includes(oldRoleId)) {
                await prisma.usersOnRoles.delete({
                  where: {
                    userId_roleId: {
                      roleId: oldRoleId,
                      userId: user.id,
                    },
                  },
                });
              }
            })
          );

          // Добавление новых ролей, которых нет в старых ролях
          await Promise.all(
            newRoleIds.map(async (newRoleId) => {
              if (!oldRoleIds.includes(newRoleId)) {
                await prisma.usersOnRoles.create({
                  data: {
                    roleId: newRoleId,
                    userId: user.id,
                  },
                });
              }
            })
          );
        } else {
          const name = data.fullname.split(" ");

          // Создание нового пользователя
          user = await prisma.user.create({
            data: {
              login,
              lastName: name[0],
              firstName: name[1],
              middleName: name[2],
            },
          });

          // Создание ролей для нового пользователя
          await Promise.all(
            newRoleIds.map(
              async (newRoleId) =>
                await prisma.usersOnRoles.create({
                  data: {
                    roleId: newRoleId,
                    userId: user.id,
                  },
                })
            )
          );
        }
        user = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        });
        delete user.password;

        result = new JwtPayload(user);
        return;
      }

      result = null;
      return;
    });

    return result;
  }

  private setRefreshCookie(res: Response, value: string, expires?: Date) {
    res.cookie("refreshToken", value, {
      ...refreshCookieOptions,
      expires: expires,
    });
  }

  private deleteRefreshCookie(res: Response) {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
      maxAge: 0,
    });
  }
}
