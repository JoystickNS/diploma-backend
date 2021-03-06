import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LessonTypesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.lessonType.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }
}
