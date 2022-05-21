import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { GetLessonsDto } from "./dto/get-lessons.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";
import { LessonsService } from "./lessons.service";

@WithoutAuthKey()
@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async get(@Query() params: GetLessonsDto) {
    return this.lessonsService.get(params);
  }

  @Put()
  async update(@Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.updateOne(updateLessonDto);
  }

  @Put("update-many")
  async updateMany(@Body() updateManyLessonDto: UpdateManyLessonsDto) {
    return this.lessonsService.updateMany(updateManyLessonDto);
  }

  @Put(":lessonId")
  async updateDateToNull(@Param("lessonId") lessonId: number) {
    return this.lessonsService.updateOne({ id: lessonId, date: null });
  }
}
