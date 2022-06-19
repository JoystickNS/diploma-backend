import { Controller, Get, NotFoundException } from "@nestjs/common";
import { DisciplinesService } from "./disciplines.service";

@Controller("disciplines")
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Get()
  async getAll() {
    const disciplines = await this.disciplinesService.getAll();

    if (!disciplines) {
      throw new NotFoundException();
    }

    return disciplines;
  }
}
