import { Controller, Get, Query } from "@nestjs/common";
import { GetUsersRolesDto } from "./dto/get-users-roles.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getWithRoles(@Query() params: GetUsersRolesDto) {
    return this.usersService.getWithRoles(params);
  }
}
