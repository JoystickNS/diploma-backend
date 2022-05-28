import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { DisciplinesService } from "./disciplines.service";

@WithoutAuthKey()
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
