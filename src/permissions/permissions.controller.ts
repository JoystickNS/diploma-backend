import { Controller, Get, Param } from "@nestjs/common";
import { ActionEnum, RoleEnum, SubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @CheckAbilities({ action: ActionEnum.Read, subject: SubjectEnum.Journal })
  async getAll() {
    return this.permissionsService.getAll();
  }
}
