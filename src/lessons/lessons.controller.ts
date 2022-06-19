import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { CreateManyLessonsDto } from "./dto/create-many-lessons.dto";
import { StartLessonDto } from "./dto/start-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";
import { LessonsService } from "./lessons.service";

@Controller("journals")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/lessons")
  async create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/lessons/create-many")
  async createMany(@Body() dto: CreateManyLessonsDto) {
    return this.lessonsService.createMany(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/lessons/:lessonId")
  async startLesson(@Body() dto: StartLessonDto) {
    return this.lessonsService.startLesson(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/lessons/update-many")
  async updateMany(@Body() dto: UpdateManyLessonsDto) {
    return this.lessonsService.updateMany(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/lessons/:lessonId")
  async update(@Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete(":journalId/lessons/:lessonId")
  async delete(@Param("lessonId") lessonId: number) {
    return this.lessonsService.delete(lessonId);
  }
}
