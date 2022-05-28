import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJournalSubgroupDto } from "./dto/create-journal-subgroup.dto";
import { UpdateManyStudentsSubgroupsDto as UpdateManyStudentsSubgroupsDto } from "./dto/update-many-students-subgroup.dto";
import { UpdateStudentSubgroupDto } from "./dto/update-student-subgroup.dto copy";

@Injectable()
export class SubgroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createJournalSubgroup(dto: CreateJournalSubgroupDto) {
    const { group, journalId, subgroup } = dto;

    try {
      const result = await this.prisma.subgroup.create({
        data: {
          group: {
            connect: {
              name: group,
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

      return {
        id: result.id,
        number: {
          id: result.subgroupNumber.id,
          value: result.subgroupNumber.value,
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException();
      }

      throw error;
    }
  }

  async updateStudentSubgroup(
    dto: UpdateStudentSubgroupDto,
    prisma?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const { newSubgroupId, studentId, subgroupId } = dto;
    const prismaClient = prisma ? prisma : this.prisma;
    try {
      const result = await prismaClient.studentsOnSubgroups.update({
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

      return {
        studentId,
        subgroup: {
          id: result.subgroup.id,
          number: {
            id: result.subgroup.subgroupNumber.id,
            value: result.subgroup.subgroupNumber.value,
          },
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw error;
      }
    }
  }

  async updateManyStudentsSubgroups(dto: UpdateManyStudentsSubgroupsDto) {
    const result = [];

    await this.prisma.$transaction(async (prisma) => {
      await Promise.all(
        dto.items.map(async (studentSubgroup) => {
          const temp = await this.updateStudentSubgroup(
            studentSubgroup,
            prisma
          );
          result.push(temp);
        })
      );
    });

    return result;
  }

  async deleteJournalSubgroup(subgroupId: number) {
    const students = await this.prisma.studentsOnSubgroups.findMany({
      where: {
        subgroupId,
      },
    });

    if (students.length > 0) {
      throw new BadRequestException();
    }

    const result = await this.prisma.subgroup.delete({
      where: {
        id: subgroupId,
      },
      select: {
        id: true,
        subgroupNumber: true,
      },
    });

    return {
      id: result.id,
      number: {
        id: result.subgroupNumber.id,
        value: result.subgroupNumber.value,
      },
    };
  }
}
