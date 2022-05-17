import { Controller, Get } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { WorkTypesService } from "./work-types.service";

@WithoutAuthKey()
@Controller("work-types")
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Get()
  async getAll() {
    return this.workTypesService.getAll();
  }
}
