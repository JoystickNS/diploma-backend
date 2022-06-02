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
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";
import { LessonsService } from "./lessons.service";

@WithoutAuthKey()
@Controller("journals")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(":journalId/lessons")
  async get(@Param("journalId") journalId: number) {
    return this.lessonsService.get({ journalId });
  }

  @Post(":journalId/lessons")
  async create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Post(":journalId/lessons/create-many")
  async createMany(@Body() dto: CreateManyLessonsDto) {
    return this.lessonsService.createMany(dto);
  }

  @Patch(":journalId/lessons/:lessonId")
  async update(@Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(dto);
  }

  @Patch(":journalId/lessons/update-many")
  async updateMany(@Body() dto: UpdateManyLessonsDto) {
    return this.lessonsService.updateMany(dto);
  }

  @Delete(":journalId/lessons/:lessonId")
  async delete(@Param("lessonId") lessonId: number) {
    return this.lessonsService.delete(lessonId);
  }
}
