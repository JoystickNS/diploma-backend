import { Controller, Get, Query } from "@nestjs/common";
import { AccessSubjectEnum, ActionEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { GetUsersRolesDto } from "./dto/get-users-roles.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @CheckAbilities({ action: ActionEnum.Read, subject: AccessSubjectEnum.Admin })
  @Get()
  async getWithRoles(@Query() params: GetUsersRolesDto) {
    return this.usersService.getWithRoles(params);
  }
}
