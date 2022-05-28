import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetStudentsDto } from "./dto/get-students.dto";

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async get(dto: GetStudentsDto) {
    const { group } = dto;

    return this.prisma.studentsOnGroups.findMany({
      where: {
        group: {
          name: group,
        },
        dateOfDischarge: null,
      },
    });
  }
}
