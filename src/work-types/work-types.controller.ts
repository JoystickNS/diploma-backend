import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { WorkTypesService } from "./work-types.service";

@WithoutAuthKey()
@Controller("work-types")
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Get()
  async getAll() {
    const workTypes = await this.workTypesService.getAll();

    if (workTypes.length === 0) {
      throw new NotFoundException();
    }

    return workTypes;
  }
}
