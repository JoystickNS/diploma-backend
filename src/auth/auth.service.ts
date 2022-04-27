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
import { IAppRequest } from "../interfaces/app-request.interface";
import { ExceptionMessages } from "../constants/exception-messages";
import { LoginDto } from "./dto/login.dto";
import { calcTokenLifeTime, refreshCookieOptions } from "../utils/utils";
import { PermissionsService } from "../permissions/permissions.service";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private permissionsService: PermissionsService,
    private tokensService: TokensService,
    private usersService: UsersService
  ) {}

  async registration(
    req: IAppRequest,
    res: Response,
    createUserDto: CreateUserDto
  ) {
    const { login, password } = createUserDto;
    const user = await this.usersService.getByLogin(login);

    if (user) {
      throw new BadRequestException(ExceptionMessages.LoginAlreadyUsed(login));
    }

    const hashedPassword = await bcrypt.hash(password, 7);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...newUser } = await this.usersService.create({
      ...createUserDto,
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

  async login(req: IAppRequest, res: Response, loginDto: LoginDto) {
    const { rememberMe } = loginDto;
    const userAgent = req.headers["user-agent"];
    const payload = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.usersService.getById(payload.id);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.usersService.getById(
        token.userId
      );
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
          updatedToken.expires
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
    const user = await this.usersService.getByLogin(login);

    if (!user) {
      return null;
    }

    const isPasswordsEqual = await bcrypt.compare(password, user.password);

    if (isPasswordsEqual) {
      return new JwtPayload(user);
    }

    return null;
  }

  private setRefreshCookie(res: Response, value: string, expires: Date) {
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
