import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WorkTypesService } from "./work-types.service";

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
