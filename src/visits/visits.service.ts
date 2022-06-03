import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateVisitDto } from "./dto/update-visit.dto";

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async update(dto: UpdateVisitDto) {
    const { isAbsent, lessonId, studentId } = dto;

    return this.prisma.visit.update({
      data: {
        isAbsent,
      },
      where: {
        lessonId_studentId: {
          lessonId,
          studentId,
        },
      },
    });
  }
}
