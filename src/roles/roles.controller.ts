import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { RolesService } from "./roles.service";

@WithoutAuthKey()
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAll() {
    const roles = await this.rolesService.getAll();

    if (!roles) {
      throw new NotFoundException();
    }

    return roles;
  }
}
