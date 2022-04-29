import { Controller, Get, Param } from "@nestjs/common";
import { ActionEnum, ObjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @CheckAbilities({ action: ActionEnum.Read, object: ObjectEnum.Journal })
  async getAll() {
    return this.permissionsService.getAll();
  }

  @Get(":userId")
  async getByUserId(@Param("userId") userId: number) {
    return this.permissionsService.getByUserId(userId);
  }
}
