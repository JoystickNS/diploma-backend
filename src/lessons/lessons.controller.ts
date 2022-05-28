import { Body, Controller, Param, Put } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";
import { LessonsService } from "./lessons.service";

@WithoutAuthKey()
@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Put("update-many")
  async updateMany(@Body() dto: UpdateManyLessonsDto) {
    return this.lessonsService.updateMany(dto);
  }

  @Put(":lessonId")
  async updateOne(
    @Param("lessonId") lessonId: number,
    @Body() dto: UpdateLessonDto
  ) {
    return this.lessonsService.updateOne({ ...dto, id: lessonId });
  }
}
