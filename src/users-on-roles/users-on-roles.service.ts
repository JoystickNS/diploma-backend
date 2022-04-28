import { BadRequestException, Injectable } from "@nestjs/common";
import { ExceptionMessages } from "../constants/exception-messages";
import { PrismaService } from "../prisma/prisma.service";
import { UserOnRoleDto } from "./dto/user-on-role.dto";

@Injectable()
export class UsersOnRolesService {
  constructor(private prisma: PrismaService) {}

  async deleteByUserId(userOnRoleDto: UserOnRoleDto) {
    const { roleId, userId } = userOnRoleDto;
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
