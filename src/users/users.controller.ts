import { Controller, Get, Query } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { GetUsersRolesDto } from "./dto/get-users-roles.dto";
import { UsersService } from "./users.service";

@WithoutAuthKey()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getWithRoles(@Query() params: GetUsersRolesDto) {
    return this.usersService.getWithRoles(params);
  }
}
