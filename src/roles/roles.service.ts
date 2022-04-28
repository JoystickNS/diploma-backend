import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.role.findMany();
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
