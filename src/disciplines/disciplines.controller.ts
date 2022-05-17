import { Controller, Get } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { DisciplinesService } from "./disciplines.service";

@WithoutAuthKey()
@Controller("disciplines")
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Get()
  async getAll() {
    return this.disciplinesService.getAll();
  }
}
