import { Controller, Get, Query } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { LessonTypesService } from "./lesson-types.service";

@WithoutAuthKey()
@Controller("lesson-types")
export class LessonTypesController {
  constructor(private readonly lessonTypesService: LessonTypesService) {}

  @Get()
  async getAll() {
    return this.lessonTypesService.getAll();
  }
}
