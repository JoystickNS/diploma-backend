import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { LABORATORY, LECTURE, PRACTICE } from "../constants/lessons";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { CreateManyLessonsDto } from "./dto/create-many-lessons.dto";
import { GetLessonsDto } from "./dto/get-lessons.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(dto: GetLessonsDto) {
    const { journalId } = dto;

    return this.prisma.lesson.findMany({
      where: {
        journalId: +journalId,
      },
    });
  }

  async create(
    dto: CreateLessonDto,
    prisma?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const prismaClient = prisma ? prisma : this.prisma;
    const { date, journalId, subgroupIds, lessonTopic, lessonTypeId } = dto;

    const lesson = await prismaClient.lesson.create({
      data: {
        date,
        journal: {
          connect: {
            id: journalId,
          },
        },
        lessonType: {
          connect: {
            id: lessonTypeId,
          },
        },
      },
    });

    await Promise.all(
      subgroupIds.map(async (subgroupId) =>
        prismaClient.lessonsOnSubgroups.create({
          data: {
            lessonId: lesson.id,
            subgroupId,
          },
        })
      )
    );

    if (lessonTopic) {
      await this.prisma.lesson.update({
        data: {
          lessonTopic: {
            connectOrCreate: {
              create: {
                name: lessonTopic,
                journalId,
                lessonTypeId: lessonTypeId,
              },
              where: {
                journalId_lessonTypeId_name: {
                  journalId,
                  lessonTypeId: lessonTypeId,
                  name: lessonTopic,
                },
              },
            },
          },
        },
        where: {
          id: lesson.id,
        },
      });
    }

    const result = await prismaClient.lesson.findUnique({
      where: {
        id: lesson.id,
      },
      select: {
        id: true,
        date: true,
        conducted: true,
        lessonType: {
          select: {
            id: true,
            name: true,
          },
        },
        lessonTopic: {
          select: {
            id: true,
            name: true,
            lessonType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subgroups: {
          select: {
            subgroup: {
              select: {
                id: true,
                subgroupNumber: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      id: result.id,
      conducted: result.conducted,
      date: result.date,
      lessonTopic: result.lessonTopic
        ? {
            id: result.lessonTopic.id,
            name: result.lessonTopic.name,
            lessonType: {
              id: result.lessonTopic.lessonType.id,
              name: result.lessonTopic.lessonType.name,
            },
          }
        : null,
      lessonType: {
        id: result.lessonType.id,
        name: result.lessonType.name,
      },
      subgroups: result.subgroups.map((subgroup) => ({
        id: subgroup.subgroup.id,
        subgroupNumber: subgroup.subgroup.subgroupNumber,
      })),
    };
  }

  async createMany(dto: CreateManyLessonsDto) {
    const journal = await this.prisma.journal.findUnique({
      where: {
        id: dto.items[0].journalId,
      },
    });

    const lectureTypeId = (
      await this.prisma.lessonType.findUnique({
        where: {
          name: LECTURE,
        },
      })
    ).id;

    const practiceTypeId = (
      await this.prisma.lessonType.findUnique({
        where: {
          name: PRACTICE,
        },
      })
    ).id;

    const laboratoryTypeId = (
      await this.prisma.lessonType.findUnique({
        where: {
          name: LABORATORY,
        },
      })
    ).id;

    const lecturesCount = dto.items.filter(
      (item) => item.lessonTypeId === lectureTypeId
    ).length;

    const practicesCount = dto.items.filter(
      (item) => item.lessonTypeId === practiceTypeId
    ).length;

    const laboratoriesCount = dto.items.filter(
      (item) => item.lessonTypeId === laboratoryTypeId
    ).length;

    if (lecturesCount > Math.ceil(journal.lectureHours / 2)) {
      throw new BadRequestException("Слишком много лекций");
    }

    if (practicesCount > Math.ceil(journal.practiceHours / 2)) {
      throw new BadRequestException("Слишком много практик");
    }

    if (laboratoriesCount > Math.ceil(journal.laboratoryHours / 2)) {
      throw new BadRequestException("Слишком много лабораторных");
    }

    const result = [];

    await this.prisma.$transaction(async (prisma) => {
      await Promise.all(
        dto.items.map(async (lesson) => {
          const temp = await this.create(lesson, prisma);
          result.push(temp);
        })
      );
    });

    return result;
  }

  async update(
    dto: UpdateLessonDto,
    prisma?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const prismaClient = prisma ? prisma : this.prisma;
    const {
      lessonId,
      date,
      lessonTopic,
      lessonTypeId,
      journalId,
      subgroupIds,
    } = dto;

    const oldSubgroupIds = (
      await prismaClient.lessonsOnSubgroups.findMany({
        where: {
          lessonId,
        },
        select: {
          subgroupId: true,
        },
      })
    ).map((oldSubgroupId) => oldSubgroupId.subgroupId);

    if (subgroupIds) {
      // Удаление подгрупп, которых нет в новых подгруппах
      await Promise.all(
        oldSubgroupIds.map(async (oldSubgroupId) => {
          if (!subgroupIds.includes(oldSubgroupId)) {
            await prismaClient.lessonsOnSubgroups.delete({
              where: {
                lessonId_subgroupId: {
                  lessonId,
                  subgroupId: oldSubgroupId,
                },
              },
            });
          }
        })
      );

      // Создание новых подгрупп
      await Promise.all(
        subgroupIds.map(async (subgroupId) => {
          if (!oldSubgroupIds.includes(subgroupId)) {
            await prismaClient.lessonsOnSubgroups.create({
              data: {
                lessonId,
                subgroupId,
              },
            });
          }
        })
      );
    }

    if (lessonTopic || lessonTopic === "") {
      await prismaClient.lesson.update({
        data: {
          lessonTopic: {
            connectOrCreate: {
              create: {
                name: lessonTopic,
                journalId,
                lessonTypeId: lessonTypeId,
              },
              where: {
                journalId_lessonTypeId_name: {
                  journalId,
                  lessonTypeId: lessonTypeId,
                  name: lessonTopic,
                },
              },
            },
          },
        },
        where: {
          id: lessonId,
        },
      });
    }

    const result = await prismaClient.lesson.update({
      data: {
        date,
        lessonTypeId,
      },
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        conducted: true,
        date: true,
        lessonTopic: {
          select: {
            id: true,
            name: true,
            lessonType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        lessonType: {
          select: {
            id: true,
            name: true,
          },
        },
        subgroups: {
          select: {
            subgroup: {
              select: {
                id: true,
                subgroupNumber: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      id: result.id,
      conducted: result.conducted,
      date: result.date,
      lessonTopic: result.lessonTopic
        ? {
            id: result.lessonTopic.id,
            name: result.lessonTopic.name,
            lessonType: {
              id: result.lessonTopic.lessonType.id,
              name: result.lessonTopic.lessonType.name,
            },
          }
        : null,
      lessonType: {
        id: result.lessonType.id,
        name: result.lessonType.name,
      },
      subgroups: result.subgroups.map((subgroup) => ({
        id: subgroup.subgroup.id,
        subgroupNumber: subgroup.subgroup.subgroupNumber,
      })),
    };
  }

  async updateMany(dto: UpdateManyLessonsDto) {
    const result = [];

    await this.prisma.$transaction(async (prisma) => {
      await Promise.all(
        dto.items.map(async (lesson) => {
          const temp = await this.update(lesson, prisma);
          result.push(temp);
        })
      );
    });

    return result;
  }

  async delete(
    lessonId: number,
    prisma?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const prismaClient = prisma ? prisma : this.prisma;

    return prismaClient.lesson.delete({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
      },
    });
  }
}
