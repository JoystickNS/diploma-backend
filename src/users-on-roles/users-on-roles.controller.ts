import { Body, Controller, Delete } from "@nestjs/common";
import { UserOnRoleDto } from "./dto/user-on-role.dto";
import { UsersOnRolesService } from "./users-on-roles.service";

@Controller("users-on-roles")
export class UsersOnRolesController {
  constructor(private readonly userOnRoleService: UsersOnRolesService) {}

  @Delete()
  async deleteByUserId(@Body() userOnRoleDto: UserOnRoleDto) {
    return this.userOnRoleService.deleteByUserId(userOnRoleDto);
  }
}
