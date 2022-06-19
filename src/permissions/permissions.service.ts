import { Injectable, NotFoundException } from "@nestjs/common";
import { AccessSubjectEnum, ActionEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
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

    const permissions = await this.prisma.permission.findMany({
      where: {
        roles: {
          some: {
            role: {
              users: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      },
      select: {
        roles: {
          select: {
            role: {
              select: {
                role: true,
              },
            },
          },
        },
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
    });

    const result = permissions.map((permission) => {
      if (
        permission.accessSubject.accessSubject === AccessSubjectEnum.Journal
      ) {
        return {
          action: permission.action.action,
          subject: permission.accessSubject.accessSubject,
          conditions: { userId },
        };
      }

      return {
        action: permission.action.action,
        subject: permission.accessSubject.accessSubject,
      };
    });

    if (
      result.find(
        (permission) => permission.subject === AccessSubjectEnum.Report
      )
    ) {
      result.push({
        action: ActionEnum.Read,
        subject: AccessSubjectEnum.Journal,
        conditions: { userId: 0 },
      });
    }

    return result;
  }
}
