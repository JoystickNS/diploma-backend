import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const roles = await this.prisma.role.findMany({
      select: {
        name: true,
        role: true,
      },
    });

    return roles;
  }

  async getByUserId(userId: number) {
    const roles = await this.prisma.usersOnRoles.findMany({
      where: {
        userId,
      },
      select: {
        role: {
          select: {
            role: true,
          },
        },
      },
    });

    return roles.map((role) => role.role.role);
  }
}
