import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttestationsOnStudentsDto } from "./dto/create-attestations-on-students.dto";
import { UpdateAttestationsOnStudentsDto } from "./dto/update-attestations-on-students.dto";

@Injectable()
export class AttestationsOnStudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttestationsOnStudentsDto) {
    return this.prisma.attestationsOnStudents.create({
      data: dto,
    });
  }

  async update(dto: UpdateAttestationsOnStudentsDto) {
    const { attestationId, studentId, credited, grade, points } = dto;
    return this.prisma.attestationsOnStudents.update({
      data: {
        credited,
        grade,
        points,
      },
      where: {
        attestationId_studentId: {
          attestationId,
          studentId,
        },
      },
    });
  }

  async delete(attestationId: number, studentId: number) {
    return this.prisma.attestationsOnStudents.delete({
      where: {
        attestationId_studentId: {
          attestationId,
          studentId,
        },
      },
      select: {
        attestationId: true,
        studentId: true,
      },
    });
  }
}
