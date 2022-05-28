import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersRolesDto } from "./dto/get-users-roles.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async getWithRoles(dto: GetUsersRolesDto) {
    const { login, roles, skip, take, name } = dto;
    const where = {} as Prisma.UserWhereInput;

    if (login) {
      where.login = {
        contains: login,
      };
    }

    if (roles) {
      where.roles = {
        some: {
          role: {
            name: {
              in: roles,
            },
          },
        },
      };
    }

    if (name) {
      const names = name.split(" ");
      if (names.length === 1) {
        where.OR = [
          {
            lastName: {
              contains: name,
            },
          },
          {
            firstName: {
              contains: name,
            },
          },
          {
            middleName: {
              contains: name,
            },
          },
        ];
      } else {
        where.AND = [
          {
            lastName: {
              contains: names[0] ? names[0] : undefined,
            },
          },
          {
            firstName: {
              contains: names[1] ? names[1] : undefined,
            },
          },
          {
            middleName: {
              contains: names[2] ? names[2] : undefined,
            },
          },
        ];
      }
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        middleName: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
      skip: skip ? skip : 0,
      take: take ? take : 10,
    });
    const totalCount = await this.prisma.user.count({
      where,
    });
    const result = users.map((user) => ({
      ...user,
      roles: [...user.roles.map((role) => role.role)],
    }));

    return {
      items: result,
      totalCount,
    };
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: {
        login,
      },
    });
  }
}
