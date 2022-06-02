import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { LECTURE } from "../constants/lessons";
import { LessonsService } from "../lessons/lessons.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJournalSubgroupDto } from "./dto/create-journal-subgroup.dto";
import { UpdateManyStudentsSubgroupsDto } from "./dto/update-many-students-subgroup.dto";
import { UpdateStudentSubgroupDto } from "./dto/update-student-subgroup.dto copy";

@Injectable()
export class SubgroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonsService: LessonsService
  ) {}

  async create(dto: CreateJournalSubgroupDto) {
    const { groupId, journalId, subgroup } = dto;
    let result;

    await this.prisma.$transaction(async (prisma) => {
      result = await prisma.subgroup.create({
        data: {
          group: {
            connect: {
              id: groupId,
            },
          },
          subgroupNumber: {
            connectOrCreate: {
              create: {
                value: subgroup,
              },
              where: {
                value: subgroup,
              },
            },
          },
          journals: {
            create: {
              journalId,
            },
          },
        },
        select: {
          id: true,
          subgroupNumber: true,
        },
      });

      const lessons = await prisma.lesson.findMany({
        where: {
          journalId,
          lessonType: {
            name: LECTURE,
          },
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        lessons.map(
          async (lesson) =>
            await prisma.lessonsOnSubgroups.create({
              data: {
                lessonId: lesson.id,
                subgroupId: result.id,
              },
            })
        )
      );
    });

    return {
      id: result.id,
      subgroupNumber: result.subgroupNumber,
    };
  }

  async updateStudent(
    dto: UpdateStudentSubgroupDto,
    prisma?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const { newSubgroupId, studentId, subgroupId } = dto;
    const prismaClient = prisma ? prisma : this.prisma;
    let result;

    if (subgroupId) {
      result = await prismaClient.studentsOnSubgroups.update({
        data: {
          subgroupId: newSubgroupId,
        },
        where: {
          studentId_subgroupId: {
            studentId,
            subgroupId,
          },
        },
        select: {
          studentId: true,
          subgroup: {
            select: {
              id: true,
              subgroupNumber: true,
            },
          },
        },
      });
    } else {
      result = await prismaClient.studentsOnSubgroups.create({
        data: {
          studentId,
          subgroupId: newSubgroupId,
        },
        select: {
          studentId: true,
          subgroup: {
            select: {
              id: true,
              subgroupNumber: true,
            },
          },
        },
      });
    }

    return {
      studentId,
      subgroup: {
        id: result.subgroup.id,
        subgroupNumber: result.subgroup.subgroupNumber,
      },
    };
  }

  async updateManyStudents(dto: UpdateManyStudentsSubgroupsDto) {
    const result = [];

    await this.prisma.$transaction(async (prisma) => {
      await Promise.all(
        dto.items.map(async (studentSubgroup) => {
          const temp = await this.updateStudent(studentSubgroup, prisma);
          result.push(temp);
        })
      );
    });

    return result;
  }

  async delete(subgroupId: number) {
    let result;

    await this.prisma.$transaction(async (prisma) => {
      const students = await prisma.studentsOnSubgroups.findMany({
        where: {
          subgroupId,
        },
      });

      if (students.length > 0) {
        throw new BadRequestException("В подгруппе не должно быть студентов");
      }

      const lessonsIds = await prisma.lesson.findMany({
        where: {
          subgroups: {
            every: {
              subgroupId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const deletedLessonsIds: number[] = [];

      await Promise.all(
        lessonsIds.map(async (lessonId) => {
          const temp = await this.lessonsService.delete(lessonId.id, prisma);
          deletedLessonsIds.push(temp.id);
        })
      );

      result = await prisma.subgroup.delete({
        where: {
          id: subgroupId,
        },
        select: {
          id: true,
        },
      });
    });

    return result;
  }
}
