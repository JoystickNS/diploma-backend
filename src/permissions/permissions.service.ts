import { Injectable } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RolesService } from "../roles/roles.service";

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}

  async getAll() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        action: true,
        role: true,
        subject: true,
      },
    });

    return permissions.map((permission) => ({
      role: permission.role.role,
      subject: permission.subject.subject,
      action: permission.action.action,
    }));
  }

  async getByRoles(roles: RoleEnum[]) {
    const permissions = await this.prisma.permission.findMany({
      distinct: ["actionId", "subjectId"],
      select: {
        action: true,
        subject: true,
      },
      where: {
        role: {
          role: {
            in: roles,
          },
        },
      },
    });

    return permissions.map((permission) => ({
      action: permission.action.action,
      subject: permission.subject.subject,
    }));
  }

  async getByUserId(userId: number) {
    const roles = await this.rolesService.getByUserId(userId);
    return this.getByRoles(roles);
  }
}
