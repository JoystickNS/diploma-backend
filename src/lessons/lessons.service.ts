import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { CreateManyLessonsDto } from "./dto/create-many-lessons.dto";
import { GetLessonsDto } from "./dto/get-lessons.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { UpdateManyLessonsDto } from "./dto/update-many-lessons.dto";

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

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
    const { date, journalId, subgroupId } = dto;

    try {
      const result = await prismaClient.lesson.create({
        data: {
          date,
          journal: {
            connect: {
              id: journalId,
            },
          },
          lessonTopic: {
            create: {
              name: "",
              journal: {
                connect: {
                  id: journalId,
                },
              },
              lessonType: {
                connect: {
                  id: 1,
                },
              },
            },
          },
          subgroups: {
            create: {
              subgroupId,
            },
          },
        },
      });

      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException();
      }
    }
  }

  async createMany(dto: CreateManyLessonsDto) {
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

  async updateOne(dto: UpdateLessonDto) {
    const { id, date, topic } = dto;

    // return this.prisma.lesson.update({
    //   data: {
    //     date,
    //     topic,
    //   },
    //   where: {
    //     id,
    //   },
    // });
  }

  async updateMany(dto: UpdateManyLessonsDto) {
    const { items } = dto;
    const ids = items.map((lesson) => lesson.id);

    await Promise.all(
      items.map((lesson, i) =>
        this.updateOne({
          id: ids[i],
          date: lesson.date,
          topic: lesson.topic,
        })
      )
    );
  }
}
