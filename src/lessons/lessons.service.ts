import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetLessonsDto } from "./dto/get-lessons.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async get(params: GetLessonsDto) {
    const { journalId = null } = params;

    if (!journalId) {
      throw new BadRequestException();
    }

    return this.prisma.lesson.findMany({
      where: {
        journalId: +journalId,
      },
    });
  }

  async updateOne(updateLessonDto: UpdateLessonDto) {
    const { id, date } = updateLessonDto;

    return this.prisma.lesson.update({
      data: {
        date,
      },
      where: {
        id,
      },
    });
  }

  async updateMany(updateManyLessonDto: UpdateManyLessonsDto) {
    const { lessons } = updateManyLessonDto;
    const ids = lessons.map((lesson) => lesson.id);

    await Promise.all(
      lessons.map((lesson, i) =>
        this.updateOne({
          id: ids[i],
          date: lesson.date,
        })
      )
    );
  }
}
