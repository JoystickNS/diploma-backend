import { Injectable, NotFoundException } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RolesService } from "../roles/roles.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService
  ) {}

  async getAll() {
    const permissions = await this.prisma.rolesOnPermissions.findMany({
      select: {
        role: true,
        permission: {
          select: {
            accessSubject: {
              select: {
                accessSubject: true,
              },
            },
            action: {
              select: {
                action: true,
              },
            },
          },
        },
      },
    });

    return permissions.map((permission) => ({
      role: permission.role.role,
      subject: permission.permission.accessSubject.accessSubject,
      action: permission.permission.action.action,
    }));
  }

  async getByUserId(userId: number) {
    const user = await this.usersService.getById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const permissions = await this.prisma.rolesOnPermissions.findMany({
      distinct: ["permissionId"],
      select: {
        role: {
          select: {
            role: true,
          },
        },
        permission: {
          select: {
            accessSubject: {
              select: {
                accessSubject: true,
              },
            },
            action: {
              select: {
                action: true,
              },
            },
          },
        },
      },
      where: {
        role: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
    });

    return permissions.map((permission) => {
      if (permission.role.role === RoleEnum.Teacher) {
        return {
          action: permission.permission.action.action,
          subject: permission.permission.accessSubject.accessSubject,
          conditions: { userId },
        };
      }

      return {
        action: permission.permission.action.action,
        subject: permission.permission.accessSubject.accessSubject,
      };
    });
  }
}
