import { Body, Controller, Delete, Get } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { DeleteRoleByUserIdDto } from "./dto/delete-role-by-user-id.dto";
import { RolesService } from "./roles.service";

@WithoutAuthKey()
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @Delete()
  async deleteByUserId(@Body() deleteRoleByUserIdDto: DeleteRoleByUserIdDto) {
    return this.rolesService.deleteByUserId(deleteRoleByUserIdDto);
  }
}
