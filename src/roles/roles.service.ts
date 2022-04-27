import { BadRequestException, Injectable } from "@nestjs/common";
import { ExceptionMessages } from "../constants/exception-messages";
import { PrismaService } from "../prisma/prisma.service";
import { DeleteRoleByUserIdDto } from "./dto/delete-role-by-user-id.dto";

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

  async deleteByUserId(deleteRoleByUserIdDto: DeleteRoleByUserIdDto) {
    const { roleId, userId } = deleteRoleByUserIdDto;
    const record = await this.prisma.usersOnRoles.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (record) {
      await this.prisma.usersOnRoles.delete({
        where: {
          userId_roleId: record,
        },
      });
      return;
    }

    throw new BadRequestException(ExceptionMessages.RoleNotFound);
  }
}
