import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: createLessonDto,
    });
  }

  async createMany(createLessonsDto: CreateLessonDto[]) {
    return this.prisma.lesson.createMany({
      data: createLessonsDto,
    });
  }
}
