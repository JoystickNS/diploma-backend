import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @CheckAbilities({ action: ActionEnum.Read, subject: AccessSubjectEnum.Admin })
  @Get()
  async getAll() {
    const roles = await this.rolesService.getAll();

    if (!roles) {
      throw new NotFoundException();
    }

    return roles;
  }
}
