import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { CreateManyLessonsDto } from "./dto/create-many-lessons.dto";
import { StartLessonDto } from "./dto/start-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";
import { LessonsService } from "./lessons.service";

@WithoutAuthKey()
@Controller("journals")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post(":journalId/lessons")
  async create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Post(":journalId/lessons/create-many")
  async createMany(@Body() dto: CreateManyLessonsDto) {
    return this.lessonsService.createMany(dto);
  }

  @Post(":journalId/lessons/:lessonId")
  async startLesson(@Body() dto: StartLessonDto) {
    return this.lessonsService.startLesson(dto);
  }

  @Patch(":journalId/lessons/update-many")
  async updateMany(@Body() dto: UpdateManyLessonsDto) {
    return this.lessonsService.updateMany(dto);
  }

  @Patch(":journalId/lessons/:lessonId")
  async update(@Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(dto);
  }

  @Delete(":journalId/lessons/:lessonId")
  async delete(@Param("lessonId") lessonId: number) {
    return this.lessonsService.delete(lessonId);
  }
}
