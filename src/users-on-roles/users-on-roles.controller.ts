import { Body, Controller, Delete, Post } from "@nestjs/common";
import { AccessSubjectEnum, ActionEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { UserOnRoleDto } from "./dto/user-on-role.dto";
import { UsersOnRolesService } from "./users-on-roles.service";

@Controller("users-on-roles")
export class UsersOnRolesController {
  constructor(private readonly userOnRoleService: UsersOnRolesService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Admin,
  })
  @Post()
  async addByUserId(@Body() dto: UserOnRoleDto) {
    return this.userOnRoleService.addByUserId(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Admin,
  })
  @Delete()
  async deleteByUserId(@Body() dto: UserOnRoleDto) {
    return this.userOnRoleService.deleteByUserId(dto);
  }
}
