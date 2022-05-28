import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as moment from "moment";
import { ExceptionMessages } from "../constants/exception-messages";
import { LECTURE, PRACTICE, LABORATORY } from "../constants/lessons";
import { ILessonTopic } from "../interfaces/ILessonTopic";
import { PrismaService } from "../prisma/prisma.service";
import { StudentsService } from "../students/students.service";
import { calcSemester } from "../utils/utils";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalListDto } from "./dto/get-journal-umk.dto";

@Injectable()
export class JournalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsService: StudentsService
  ) {}

  async create(userId: number, dto: CreateJournalDto) {
    const {
      control,
      discipline,
      group,
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
              name: discipline,
            },
          },
          control: {
            connect: {
              name: control,
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
        throw new BadRequestException(ExceptionMessages.BadRequest);
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
                  workTypeId: (
                    await prisma.workType.findUnique({
                      select: {
                        id: true,
                      },
                      where: {
                        name: attestation.workType,
                      },
                    })
                  ).id,
                }))
              )),
            ],
          })
          .catch(() => {
            throw new BadRequestException(ExceptionMessages.BadRequest);
          });
      }

      await this.createLessonTopics(LECTURE, lectureTopics, journal.id, prisma);

      await this.createLessonTopics(
        PRACTICE,
        practiceTopics,
        journal.id,
        prisma
      );

      await this.createLessonTopics(
        LABORATORY,
        laboratoryTopics,
        journal.id,
        prisma
      );

      const subgroup = await prisma.subgroup.create({
        data: {
          group: {
            connect: {
              name: group,
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
        throw new BadRequestException(ExceptionMessages.BadRequest);
      }

      const students = await this.studentsService.get({ group });

      if (!students) {
        throw new NotFoundException(ExceptionMessages.StudentsNotFound);
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
          throw new BadRequestException(ExceptionMessages.BadRequest);
        });

      await prisma.subgroupsOnJournals
        .create({
          data: {
            journalId: journal.id,
            subgroupId: subgroup.id,
          },
        })
        .catch(() => {
          throw new BadRequestException(ExceptionMessages.BadRequest);
        });
    });
  }

  async getAllList(dto?: GetJournalListDto) {
    const {
      deleted = undefined,
      discipline = undefined,
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
        discipline: {
          name: discipline,
        },
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
      throw new NotFoundException();
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
      .filter((lesson) => lesson.lessonTopic.lessonType.name === LECTURE)
      .map((lesson) => ({
        name: lesson.lessonTopic.name,
      }));
    const practiceTopics = journalUmkInfo.lessons
      .filter((lesson) => lesson.lessonTopic.lessonType.name === PRACTICE)
      .map((lesson) => ({
        name: lesson.lessonTopic.name,
      }));
    const laboratoryTopics = journalUmkInfo.lessons
      .filter((lesson) => lesson.lessonTopic.lessonType.name === LABORATORY)
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
            points: {
              select: {
                id: true,
                annotation: true,
                numberOfPoints: true,
                studentId: true,
              },
            },
            visits: {
              select: {
                id: true,
                isAbsent: true,
                studentId: true,
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
            students: {
              select: {
                credited: true,
                pointsOrGrade: true,
                studentId: true,
              },
            },
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
                students: {
                  select: {
                    student: {
                      select: {
                        id: true,
                        firstName: true,
                        middleName: true,
                        lastName: true,
                      },
                    },
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
      throw new NotFoundException();
    }

    const students = [];

    journalFullInfo.subgroups.forEach((subgroup) =>
      subgroup.subgroup.students.forEach((student) => {
        students.push({
          ...student.student,
          subgroup: {
            id: subgroup.subgroup.id,
            number: {
              id: subgroup.subgroup.subgroupNumber.id,
              value: subgroup.subgroup.subgroupNumber.value,
            },
          },
        });
      })
    );

    students.sort((a: any, b: any) => {
      if (a.lastName === b.lastName) {
        if (a.firstName === b.firstName) {
          if (a.middleName > b.middleName) {
            return 1;
          } else {
            return 1;
          }
        } else if (a.firstName > b.firstName) {
          return 1;
        } else {
          return -1;
        }
      } else if (a.lastName > b.lastName) {
        return 1;
      } else {
        return -1;
      }
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
        number: {
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
        students: attestation.students.map((student) => ({
          ...student,
        })),
      })),
      lessons: journalFullInfo.lessons.map((lesson) => ({
        id: lesson.id,
        conducted: lesson.conducted,
        date: lesson.date,
        topic: lesson.lessonTopic
          ? {
              id: lesson.lessonTopic.id,
              name: lesson.lessonTopic.name,
              type: lesson.lessonTopic.lessonType.name,
            }
          : null,
        subgroups: lesson.subgroups.map((subgroup) => ({
          id: subgroup.subgroup.id,
          number: {
            id: subgroup.subgroup.subgroupNumber.id,
            value: subgroup.subgroup.subgroupNumber.value,
          },
        })),
        points: lesson.points,
        visits: lesson.visits,
      })),
      students,
      lectureTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === LECTURE)
        .map((lessonTopic) => ({
          id: lessonTopic.id,
          name: lessonTopic.name,
        })),
      practiceTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === PRACTICE)
        .map((lessonTopic) => ({
          id: lessonTopic.id,
          name: lessonTopic.name,
        })),
      laboratoryTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === LABORATORY)
        .map((lessonTopic) => ({
          id: lessonTopic.id,
          name: lessonTopic.name,
        })),
    };
  }

  private async createLessonTopics(
    type: string,
    topics: ILessonTopic[],
    journalId: number,
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >
  ) {
    const lessonTypeId = (
      await prisma.lessonType.findUnique({
        where: {
          name: type,
        },
      })
    ).id;

    return prisma.lessonTopic
      .createMany({
        data: topics.map((topic) => ({
          name: topic.name,
          journalId,
          lessonTypeId,
        })),
      })
      .catch(() => {
        throw new BadRequestException(ExceptionMessages.BadRequest);
      });
  }

  // private async createLessons(
  //   type: string,
  //   lessonsCount: number,
  //   topics: ILessonTopic[],
  //   journalId: number,
  //   prisma: Omit<
  //     PrismaClient,
  //     "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  //   >
  // ) {
  //   const lessonTypeId = (
  //     await prisma.lessonType.findUnique({
  //       where: {
  //         name: type,
  //       },
  //     })
  //   ).id;

  //   if (!lessonTypeId) {
  //     throw new NotFoundException(ExceptionMessages.LessonTypeNotFound);
  //   }

  //   await Promise.all(
  //     topics.map((topic) => {
  //       prisma.lesson.create({
  //         data: {
  //           journalId,
  //           lessonTypeId,
  //           topic: topic.name,
  //         },
  //       });
  //     })
  //   ).catch(() => {
  //     throw new BadRequestException(ExceptionMessages.BadRequest);
  //   });

  //   async function temp() {
  //     const promises = [];

  //     for (let i = topics.length; i <= lessonsCount; i++) {
  //       promises.push(
  //         prisma.lesson.create({
  //           data: {
  //             journalId,
  //             lessonTypeId,
  //           },
  //         })
  //       );
  //     }

  //     return Promise.all(promises).catch(() => {
  //       throw new BadRequestException(ExceptionMessages.BadRequest);
  //     });
  //   }

  //   temp.call(this);
  // }

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
      throw new BadRequestException(ExceptionMessages.BadRequest);
    }

    return journalOnGrade;
  }
}
