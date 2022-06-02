import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as moment from "moment";
import { ExceptionMessages } from "../constants/exception-messages";
import { LECTURE, PRACTICE, LABORATORY } from "../constants/lessons";
import { PrismaService } from "../prisma/prisma.service";
import { calcSemester } from "../utils/utils";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalListDto } from "./dto/get-journal-umk.dto";

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateJournalDto) {
    const {
      controlId,
      disciplineId,
      groupId,
      laboratoryHours,
      lectureHours,
      practiceHours,
      attestations,
      laboratoryTopics,
      lectureTopics,
      maximumPoints,
      pointsForFive,
      pointsForFour,
      pointsForThree,
      practiceTopics,
    } = dto;

    await this.prisma.$transaction(async (prisma) => {
      const journal = await prisma.journal.create({
        data: {
          discipline: {
            connect: {
              id: disciplineId,
            },
          },
          control: {
            connect: {
              id: controlId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          laboratoryHours,
          lectureHours,
          practiceHours,
          maximumPoints,
          attestations: {
            create: {},
          },
        },
      });

      if (!journal) {
        throw new BadRequestException("Произошла ошибка при создании журнала");
      }

      if (pointsForThree) {
        await this.createGrade(pointsForThree, 3, journal.id, prisma);
      }

      if (pointsForFour) {
        await this.createGrade(pointsForFour, 4, journal.id, prisma);
      }

      if (pointsForFive) {
        await this.createGrade(pointsForFive, 5, journal.id, prisma);
      }

      if (attestations.length > 0) {
        await prisma.attestation
          .createMany({
            data: [
              ...(await Promise.all(
                attestations.map(async (attestation) => ({
                  workTopic: attestation.workTopic,
                  maximumPoints: attestation.maximumPoints,
                  journalId: journal.id,
                  workTypeId: attestation.workTypeId,
                }))
              )),
            ],
          })
          .catch(() => {
            throw new BadRequestException(
              "Произошла ошибка при создании аттестаций"
            );
          });
      }

      await this.createTopics(LECTURE, lectureTopics, journal.id, prisma);

      await this.createTopics(PRACTICE, practiceTopics, journal.id, prisma);

      await this.createTopics(LABORATORY, laboratoryTopics, journal.id, prisma);

      const subgroup = await prisma.subgroup.create({
        data: {
          group: {
            connect: {
              id: groupId,
            },
          },
          subgroupNumber: {
            connectOrCreate: {
              create: {
                value: 1,
              },
              where: {
                value: 1,
              },
            },
          },
        },
      });

      if (!subgroup) {
        throw new BadRequestException(
          "Произошла ошибка при создании подгруппы"
        );
      }

      const students = await prisma.studentsOnGroups.findMany({
        where: {
          groupId,
        },
      });

      if (!students) {
        throw new NotFoundException("В выбранной группе нет студентов");
      }

      await prisma.studentsOnSubgroups
        .createMany({
          data: [
            ...students.map((student) => ({
              studentId: student.id,
              subgroupId: subgroup.id,
            })),
          ],
        })
        .catch(() => {
          throw new BadRequestException(
            "Произошла ошибка при добавлении студентов в подгруппу"
          );
        });

      await prisma.subgroupsOnJournals
        .create({
          data: {
            journalId: journal.id,
            subgroupId: subgroup.id,
          },
        })
        .catch(() => {
          throw new BadRequestException(
            "Произошла ошибка при добавлении подгруппы в журнал"
          );
        });
    });
  }

  async getAllList(dto?: GetJournalListDto) {
    const {
      deleted = undefined,
      disciplineId = undefined,
      userId = undefined,
    } = dto;
    const journals = await this.prisma.journal.findMany({
      select: {
        id: true,
        createdAt: true,
        discipline: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
        subgroups: {
          select: {
            subgroup: {
              select: {
                group: {
                  select: {
                    id: true,
                    name: true,
                    startYear: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        deleted,
        disciplineId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return journals.map((journal) => {
      return {
        id: journal.id,
        discipline: journal.discipline.name,
        group: journal.subgroups[0].subgroup.group.name,
        user: {
          firstName: journal.user.firstName,
          lastName: journal.user.lastName,
          middleName: journal.user.middleName,
        },
        semester: calcSemester(
          journal.subgroups[0].subgroup.group.startYear,
          moment(journal.createdAt)
        ),
      };
    });
  }

  async getUmkInfoById(journalId: number) {
    const journalUmkInfo = await this.prisma.journal.findUnique({
      select: {
        id: true,
        control: {
          select: {
            name: true,
          },
        },
        lectureHours: true,
        practiceHours: true,
        laboratoryHours: true,
        maximumPoints: true,
        grades: {
          select: {
            grade: true,
            minimumPoints: true,
          },
        },
        attestations: {
          select: {
            id: true,
            workType: {
              select: {
                name: true,
              },
            },
            workTopic: true,
            maximumPoints: true,
          },
        },
        lessons: {
          select: {
            lessonTopic: {
              select: {
                name: true,
                lessonType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: journalId,
      },
    });

    if (!journalUmkInfo) {
      throw new NotFoundException("Журнал не найден");
    }

    const attestations = journalUmkInfo.attestations
      .filter((attestation) => attestation.workType)
      .map((attestation) => ({
        id: attestation.id,
        workType: attestation.workType.name,
        workTopic: attestation.workTopic,
        maximumPoints: attestation.maximumPoints,
      }));

    const lectureTopics = journalUmkInfo.lessons
      .filter(
        (lesson) =>
          lesson.lessonTopic && lesson.lessonTopic.lessonType.name === LECTURE
      )
      .map((lesson) => ({
        name: lesson.lessonTopic.name,
      }));
    const practiceTopics = journalUmkInfo.lessons
      .filter(
        (lesson) =>
          lesson.lessonTopic && lesson.lessonTopic.lessonType.name === PRACTICE
      )
      .map((lesson) => ({
        name: lesson.lessonTopic.name,
      }));
    const laboratoryTopics = journalUmkInfo.lessons
      .filter(
        (lesson) =>
          lesson.lessonTopic &&
          lesson.lessonTopic.lessonType.name === LABORATORY
      )
      .map((lesson) => ({
        name: lesson.lessonTopic.name,
      }));

    const pointsForThree = journalUmkInfo.grades.find(
      (grade) => grade.grade.value === 3
    );
    const pointsForFour = journalUmkInfo.grades.find(
      (grade) => grade.grade.value === 4
    );
    const pointsForFive = journalUmkInfo.grades.find(
      (grade) => grade.grade.value === 5
    );

    return {
      id: journalUmkInfo.id,
      control: journalUmkInfo.control.name,
      lectureHours: journalUmkInfo.lectureHours,
      practiceHours: journalUmkInfo.practiceHours,
      laboratoryHours: journalUmkInfo.laboratoryHours,
      pointsForThree: pointsForThree ? pointsForThree.minimumPoints : null,
      pointsForFour: pointsForFour ? pointsForFour.minimumPoints : null,
      pointsForFive: pointsForFive ? pointsForFive.minimumPoints : null,
      maximumPoints: journalUmkInfo.maximumPoints,
      attestations,
      lectureTopics,
      practiceTopics,
      laboratoryTopics,
    };
  }

  async getJournalFullInfo(journalId: number) {
    const journalFullInfo = await this.prisma.journal.findUnique({
      select: {
        id: true,
        createdAt: true,
        control: {
          select: {
            id: true,
            name: true,
          },
        },
        discipline: {
          select: {
            id: true,
            name: true,
          },
        },
        lectureHours: true,
        practiceHours: true,
        laboratoryHours: true,
        maximumPoints: true,
        grades: {
          select: {
            grade: {
              select: {
                id: true,
                value: true,
              },
            },
            minimumPoints: true,
          },
        },
        lessons: {
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
                    subgroupNumber: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
        lessonTopics: {
          select: {
            id: true,
            lessonType: {
              select: {
                id: true,
                name: true,
              },
            },
            name: true,
          },
        },
        attestations: {
          select: {
            id: true,
            workType: {
              select: {
                id: true,
                name: true,
              },
            },
            workTopic: true,
            maximumPoints: true,
            // students: {
            //   select: {
            //     credited: true,
            //     pointsOrGrade: true,
            //     studentId: true,
            //   },
            // },
          },
        },
        subgroups: {
          select: {
            subgroup: {
              select: {
                id: true,
                subgroupNumber: true,
                group: {
                  select: {
                    id: true,
                    name: true,
                    startYear: true,
                  },
                },
              },
            },
          },
          orderBy: {
            subgroup: {
              subgroupNumber: {
                value: "asc",
              },
            },
          },
        },
      },
      where: {
        id: journalId,
      },
    });

    if (!journalFullInfo) {
      throw new NotFoundException("Журнал не найден");
    }

    const subgroupIds = (
      await this.prisma.subgroupsOnJournals.findMany({
        select: {
          subgroupId: true,
        },
        where: {
          journalId: journalFullInfo.id,
        },
      })
    ).map((subgroup) => subgroup.subgroupId);

    const students = await this.prisma.studentsOnGroups.findMany({
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
              where: {
                subgroupId: {
                  in: subgroupIds,
                },
              },
            },
          },
        },
      },
      where: {
        groupId: journalFullInfo.subgroups[0].subgroup.group.id,
        dateOfDischarge: null,
      },
    });

    const lessonTypes = await this.prisma.lessonType.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!lessonTypes) {
      throw new NotFoundException("Типы занятий не найдены");
    }

    const lessonIds = journalFullInfo.lessons.map((lesson) => lesson.id);

    const points = await this.prisma.points.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },
      },
      select: {
        id: true,
        annotation: true,
        numberOfPoints: true,
        lessonId: true,
        studentId: true,
      },
    });

    const visits = await this.prisma.visit.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },
      },
      select: {
        id: true,
        isAbsent: true,
        lessonId: true,
        studentId: true,
      },
    });

    return {
      id: journalFullInfo.id,
      discipline: {
        id: journalFullInfo.discipline.id,
        name: journalFullInfo.discipline.name,
      },
      group: {
        id: journalFullInfo.subgroups[0].subgroup.group.id,
        name: journalFullInfo.subgroups[0].subgroup.group.name,
      },
      subgroups: journalFullInfo.subgroups.map((subgroup) => ({
        id: subgroup.subgroup.id,
        subgroupNumber: {
          id: subgroup.subgroup.subgroupNumber.id,
          value: subgroup.subgroup.subgroupNumber.value,
        },
      })),
      semester: calcSemester(
        journalFullInfo.subgroups[0].subgroup.group.startYear,
        moment(journalFullInfo.createdAt)
      ),
      control: {
        id: journalFullInfo.control.id,
        name: journalFullInfo.control.name,
      },
      lectureHours: journalFullInfo.lectureHours,
      practiceHours: journalFullInfo.practiceHours,
      laboratoryHours: journalFullInfo.laboratoryHours,
      maximumPoints: journalFullInfo.maximumPoints,
      grades: journalFullInfo.grades.map((grade) => ({
        id: grade.grade.id,
        value: grade.grade.value,
        minimumPoints: grade.minimumPoints,
      })),
      attestations: journalFullInfo.attestations.map((attestation) => ({
        id: attestation.id,
        workType: attestation.workType
          ? {
              id: attestation.workType.id,
              name: attestation.workType.name,
            }
          : null,
        workTopic: attestation?.workTopic,
        maximumPoints: attestation?.maximumPoints,
        // students: attestation.students.map((student) => ({
        //   ...student,
        // })),
      })),
      lessons: journalFullInfo.lessons.map((lesson) => ({
        id: lesson.id,
        conducted: lesson.conducted,
        date: lesson.date,
        lessonTopic: lesson.lessonTopic
          ? {
              id: lesson.lessonTopic.id,
              name: lesson.lessonTopic.name,
              lessonType: {
                id: lesson.lessonTopic.lessonType.id,
                name: lesson.lessonTopic.lessonType.name,
              },
            }
          : null,
        lessonType: {
          id: lesson.lessonType.id,
          name: lesson.lessonType.name,
        },
        subgroups: lesson.subgroups.map((subgroup) => ({
          id: subgroup.subgroup.id,
          subgroupNumber: subgroup.subgroup.subgroupNumber,
        })),
      })),
      points,
      visits,
      lessonTypes: lessonTypes.map((lessonType) => ({
        id: lessonType.id,
        name: lessonType.name,
      })),
      lessonTopics: journalFullInfo.lessonTopics.map((lessonTopic) => ({
        id: lessonTopic.id,
        name: lessonTopic.name,
        lessonType: {
          id: lessonTopic.lessonType.id,
          name: lessonTopic.lessonType.name,
        },
      })),
      students: students.map((student) => ({
        id: student.student.id,
        firstName: student.student.firstName,
        middleName: student.student.middleName,
        lastName: student.student.lastName,
        subgroup:
          student.student.subgroups.length > 0
            ? {
                id: student.student.subgroups[0].subgroup.id,
                subgroupNumber:
                  student.student.subgroups[0].subgroup.subgroupNumber,
              }
            : null,
      })),
    };
  }

  private async createTopics(
    lessonType: string,
    topics: string[],
    journalId: number,
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const lessonTypeId = (
      await prisma.lessonType.findUnique({
        where: {
          name: lessonType,
        },
      })
    ).id;

    if (!lessonTypeId) {
      throw new NotFoundException("Тип занятия не найден");
    }

    return prisma.lessonTopic
      .createMany({
        data: topics.map((topic) => ({
          name: topic,
          journalId,
          lessonTypeId,
        })),
      })
      .catch(() => {
        throw new BadRequestException(ExceptionMessages.BadRequest);
      });
  }

  private async createGrade(
    minimumPoints: number,
    gradeValue: number,
    journalId: number,
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const journalOnGrade = await prisma.journalsOnGrades.create({
      data: {
        minimumPoints,
        grade: {
          connect: {
            value: gradeValue,
          },
        },
        journal: {
          connect: {
            id: journalId,
          },
        },
      },
    });

    if (!journalOnGrade) {
      throw new BadRequestException(
        "Ошибка при создании минимальных баллов для оценки"
      );
    }

    return journalOnGrade;
  }
}
