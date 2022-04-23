import { Injectable } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

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

  async getByRole(role: RoleEnum) {
    const permissions = await this.getAll();

    return permissions.filter((permission) => permission.role === role);
  }
}
