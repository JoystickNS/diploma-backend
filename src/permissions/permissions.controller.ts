import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  // @CheckAbilities({ action: ActionEnum.Read, object: ObjectEnum.Journal })
  // @CheckAbilities({ action: "Create", object: "Admin" })
  async getAll() {
    const permissions = await this.permissionsService.getAll();

    if (!permissions) {
      throw new NotFoundException();
    }

    return permissions;
  }

  @Get(":userId")
  async getByUserId(@Param("userId") userId: number) {
    const permissions = await this.permissionsService.getByUserId(userId);

    if (!permissions) {
      throw new NotFoundException();
    }

    return permissions;
  }
}
