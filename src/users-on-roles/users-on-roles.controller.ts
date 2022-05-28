import { Body, Controller, Delete, Post } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { UserOnRoleDto } from "./dto/user-on-role.dto";
import { UsersOnRolesService } from "./users-on-roles.service";

@WithoutAuthKey()
@Controller("users-on-roles")
export class UsersOnRolesController {
  constructor(private readonly userOnRoleService: UsersOnRolesService) {}

  @Post()
  async addByUserId(@Body() dto: UserOnRoleDto) {
    return this.userOnRoleService.addByUserId(dto);
  }

  @Delete()
  async deleteByUserId(@Body() dto: UserOnRoleDto) {
    return this.userOnRoleService.deleteByUserId(dto);
  }
}
