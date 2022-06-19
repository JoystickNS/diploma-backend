import { Controller, Get, NotFoundException } from "@nestjs/common";
import { LessonTypesService } from "./lesson-types.service";

@Controller("lesson-types")
export class LessonTypesController {
  constructor(private readonly lessonTypesService: LessonTypesService) {}

  @Get()
  async getAll() {
    const lessonTypes = await this.lessonTypesService.getAll();

    if (!lessonTypes) {
      throw new NotFoundException();
    }

    return lessonTypes;
  }
}
