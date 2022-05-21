import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as moment from "moment";
import { ExceptionMessages } from "../constants/exception-messages";
import { ILessonTopic } from "../interfaces/ILessonTopic";
import { PrismaService } from "../prisma/prisma.service";
import { SubgroupsService } from "../subgroups/subgroups.service";
import { calcSemester } from "../utils/utils";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalListDto } from "./dto/get-journal-umk.dto";

@Injectable()
export class JournalsService {
  constructor(
    private prisma: PrismaService,
    private subgroupsService: SubgroupsService
  ) {}

  async create(userId: number, createJournalDto: CreateJournalDto) {
    const {
      control,
      discipline,
      groups,
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
    } = createJournalDto;

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
        },
      });

      if (!journal) {
        throw new InternalServerErrorException(
          ExceptionMessages.InternalServer
        );
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
            throw new InternalServerErrorException(
              ExceptionMessages.InternalServer
            );
          });
      }

      if (lectureTopics.length > 0) {
        await this.createLessonTopicsAndLessons(
          "Лекция",
          Math.ceil(lectureHours / 2),
          lectureTopics,
          journal.id,
          prisma
        );
      }

      if (practiceTopics.length > 0) {
        await this.createLessonTopicsAndLessons(
          "Практика",
          Math.ceil(practiceHours / 2),
          practiceTopics,
          journal.id,
          prisma
        );
      }

      if (laboratoryTopics.length > 0) {
        await this.createLessonTopicsAndLessons(
          "Лабораторная",
          Math.ceil(laboratoryHours / 2),
          laboratoryTopics,
          journal.id,
          prisma
        );
      }

      await Promise.all(
        groups.map(async (group) => {
          const subgroup = await prisma.subgroup.create({
            data: {
              group: {
                connect: {
                  name: group,
                },
              },
              subgroupNumber: {
                connect: {
                  value: 1,
                },
              },
            },
          });

          if (!subgroup) {
            throw new InternalServerErrorException(
              ExceptionMessages.InternalServer
            );
          }

          const students = await prisma.student.findMany({
            where: {
              group: {
                name: group,
              },
            },
          });

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
              throw new InternalServerErrorException(
                ExceptionMessages.InternalServer
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
              throw new InternalServerErrorException(
                ExceptionMessages.InternalServer
              );
            });
        })
      );
    });
  }

  async getAllList(getJournalListDto?: GetJournalListDto) {
    const {
      deleted = undefined,
      discipline = undefined,
      userId = undefined,
    } = getJournalListDto;
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
      const groupsWithoutDuplicates =
        this.subgroupsService.getGroupsWithoutDuplicates(journal.subgroups);

      return {
        id: journal.id,
        discipline: journal.discipline.name,
        groups: groupsWithoutDuplicates.map((group) => group.name),
        user: {
          firstName: journal.user.firstName,
          lastName: journal.user.lastName,
          middleName: journal.user.middleName,
        },
        semester: calcSemester(
          groupsWithoutDuplicates[0].startYear,
          moment(journal.createdAt)
        ),
      };
    });
  }

  async getJournalUmkInfoById(journalId: number) {
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
        lessonTopics: {
          select: {
            id: true,
            name: true,
            lessonType: true,
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

    const attestations = journalUmkInfo.attestations.map((attestation) => ({
      id: attestation.id,
      workType: attestation.workType.name,
      workTopic: attestation.workTopic,
      maximumPoints: attestation.maximumPoints,
    }));

    const lectureTopics = journalUmkInfo.lessonTopics
      .filter((lessonTopic) => lessonTopic.lessonType.name === "Лекция")
      .map((lessonTopic) => ({
        id: lessonTopic.id,
        name: lessonTopic.name,
      }));
    const practiceTopics = journalUmkInfo.lessonTopics
      .filter((lessonTopic) => lessonTopic.lessonType.name === "Практика")
      .map((practiceTopic) => ({
        id: practiceTopic.id,
        name: practiceTopic.name,
      }));
    const laboratoryTopics = journalUmkInfo.lessonTopics
      .filter((lessonTopic) => lessonTopic.lessonType.name === "Лабораторная")
      .map((laboratoryTopic) => ({
        id: laboratoryTopic.id,
        name: laboratoryTopic.name,
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
        createdAt: true,
        control: {
          select: {
            name: true,
          },
        },
        discipline: {
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
            grade: {
              select: {
                value: true,
              },
            },
            minimumPoints: true,
          },
        },
        lessons: {
          select: {
            id: true,
            date: true,
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
          orderBy: {
            date: "asc",
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
                students: true,
              },
            },
          },
        },
        lessonTopics: {
          select: {
            id: true,
            lessonType: {
              select: {
                name: true,
                lessonTopics: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            name: true,
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

    const groupsWithoutDuplicates =
      this.subgroupsService.getGroupsWithoutDuplicates(
        journalFullInfo.subgroups
      );

    return {
      discipline: journalFullInfo.discipline.name,
      groups: groupsWithoutDuplicates.map((group) => group.name),
      semester: calcSemester(
        groupsWithoutDuplicates[0].startYear,
        moment(journalFullInfo.createdAt)
      ),
      control: journalFullInfo.control.name,
      lectureHours: journalFullInfo.lectureHours,
      practiceHours: journalFullInfo.practiceHours,
      laboratoryHours: journalFullInfo.laboratoryHours,
      maximumPoints: journalFullInfo.maximumPoints,
      grades: journalFullInfo.grades.map((grade) => ({
        value: grade.grade.value,
        minimumPoints: grade.minimumPoints,
      })),
      attestations: journalFullInfo.attestations.map((attestation) => ({
        id: attestation.id,
        workType: attestation.workType.name,
        workTopic: attestation.workTopic,
        maximumPoints: attestation.maximumPoints,
      })),
      lessons: journalFullInfo.lessons.map((lesson) => ({
        id: lesson.id,
        date: lesson.date,
        topic: lesson.lessonTopic.name,
        type: lesson.lessonTopic.lessonType.name,
      })),
      // lectureTopics: journalFullInfo.lessonTopics
      //   .filter((lessonTopic) => lessonTopic.lessonType.name === "Лекция")
      //   .map((lessonTopic) => ({
      //     id: lessonTopic.id,
      //     name: lessonTopic.name,
      //   })),
      // practiceTopics: journalFullInfo.lessonTopics
      //   .filter((lessonTopic) => lessonTopic.lessonType.name === "Практика")
      //   .map((lessonTopic) => ({
      //     id: lessonTopic.id,
      //     name: lessonTopic.name,
      //   })),
      // laboratoryTopics: journalFullInfo.lessonTopics
      //   .filter((lessonTopic) => lessonTopic.lessonType.name === "Лабораторная")
      //   .map((lessonTopic) => ({
      //     id: lessonTopic.id,
      //     name: lessonTopic.name,
      //   })),
    };
  }

  private async createLessonTopicsAndLessons(
    lessonType: string,
    lessonsNumber: number,
    lessonTopics: ILessonTopic[],
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
      throw new NotFoundException(ExceptionMessages.LessonTypeNotFound);
    }

    await Promise.all(
      lessonTopics.map((lessonTopic) => {
        prisma.lessonTopic.create({
          data: {
            name: lessonTopic.name,
            journalId,
            lessonTypeId,
            lessons: {
              create: {
                journalId,
              },
            },
          },
        });
      })
    ).catch(() => {
      throw new InternalServerErrorException(ExceptionMessages.InternalServer);
    });

    async function temp() {
      const promises = [];

      for (let i = lessonTopics.length; i <= lessonsNumber; i++) {
        promises.push(
          prisma.lessonTopic.create({
            data: {
              name: "",
              journalId,
              lessonTypeId,
              lessons: {
                create: {
                  journalId,
                },
              },
            },
          })
        );
      }

      return Promise.all(promises).catch(() => {
        throw new InternalServerErrorException(
          ExceptionMessages.InternalServer
        );
      });
    }

    temp.call(this);
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
      throw new InternalServerErrorException(ExceptionMessages.InternalServer);
    }

    return journalOnGrade;
  }
}
