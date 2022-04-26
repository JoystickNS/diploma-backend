import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersRolesDto } from "./dto/get-users-roles.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async getWithRoles(getUsersRolesDto: GetUsersRolesDto) {
    const { login, roles, skip, take } = getUsersRolesDto;
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
            role: {
              select: {
                name: true,
              },
            },
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
      roles: [...user.roles.map((role) => role.role.name)],
    }));

    return {
      users: result,
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
