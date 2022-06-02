import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtPayload } from "../classes/jwt-payload";
import { CreateTokenDto } from "./dto/create-token.dto";
import { UpdateTokenDto } from "./dto/update-token.dto";

@Injectable()
export class TokensService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  generate(payload: JwtPayload) {
    payload = { ...payload };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${this.configService.get("accessTokenAliveTime")}ms`,
        privateKey: this.configService.get("privateKey"),
        algorithm: "RS256",
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${this.configService.get("refreshTokenAliveTime")}ms`,
        privateKey: this.configService.get("privateKey"),
        algorithm: "RS256",
      }),
    };
  }

  async create(dto: CreateTokenDto) {
    return this.prisma.token.create({
      data: dto,
    });
  }

  async update(refreshToken: string, dto: UpdateTokenDto) {
    return this.prisma.token.update({
      where: {
        refreshToken,
      },
      data: dto,
    });
  }

  async updateFirstByUserId(userId: number, dto: UpdateTokenDto) {
    const firstToken = await this.prisma.token.findFirst({
      where: {
        userId,
      },
    });

    return this.update(firstToken.refreshToken, dto);
  }

  async delete(refreshToken: string) {
    return this.prisma.token.delete({
      where: {
        refreshToken,
      },
    });
  }

  async getByRefreshToken(refreshToken: string) {
    return this.prisma.token.findUnique({
      where: {
        refreshToken,
      },
    });
  }

  async getAllByUserId(userId: number) {
    return this.prisma.token.findMany({
      where: {
        userId,
        expires: {
          not: null,
        },
      },
    });
  }

  // Каждый день удаляются сессионные токены
  @Cron(CronExpression.EVERY_WEEKDAY)
  private async deleteExpiredSessions() {
    let i = 0;

    while (true) {
      const records = await this.prisma.token.findMany({
        skip: i,
        take: 10000,
      });

      if (records.length > 0) {
        i += records.length;
      } else {
        break;
      }

      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      records.forEach((record) => {
        if (!record.expires) {
          const isSessionTokenExpired =
            Date.now() - record.updatedAt.getTime() > dayInMilliseconds;

          if (isSessionTokenExpired) {
            this.delete(record.refreshToken);
          }
        }
      });
    }
  }

  // Каждую неделю удаляются просроченные запомненные токены
  @Cron(CronExpression.EVERY_WEEK)
  private async deleteExpiredMemorizedTokens() {
    let i = 0;

    while (true) {
      const records = await this.prisma.token.findMany({
        skip: i,
        take: 10000,
      });

      if (records.length > 0) {
        i += records.length;
      } else {
        break;
      }

      records.forEach((record) => {
        if (record.expires) {
          const isMemorizedTokenExpired = record.expires.getTime() < Date.now();

          if (isMemorizedTokenExpired) {
            this.delete(record.refreshToken);
          }
        }
      });
    }
  }
}
