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
        object: true,
      },
    });

    return permissions.map((permission) => ({
      role: permission.role.role,
      object: permission.object.object,
      action: permission.action.action,
    }));
  }

  async getByRoles(roles: RoleEnum[]) {
    const permissions = await this.prisma.permission.findMany({
      distinct: ["actionId", "objectId"],
      select: {
        action: true,
        object: true,
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
      object: permission.object.object,
    }));
  }

  async getByUserId(userId: number) {
    const roles = await this.rolesService.getByUserId(userId);
    return this.getByRoles(roles);
  }
}
