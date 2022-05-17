import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as moment from "moment";
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

    this.prisma.$transaction(async () => {
      const journal = await this.prisma.journal.create({
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

      if (pointsForThree) {
        await this.createGrade(pointsForThree, 3, journal.id);
      }

      if (pointsForFour) {
        await this.createGrade(pointsForFour, 4, journal.id);
      }

      if (pointsForFive) {
        await this.createGrade(pointsForFive, 5, journal.id);
      }

      if (attestations.length > 0) {
        await this.prisma.attestation.createMany({
          data: [
            ...(await Promise.all(
              attestations.map(async (attestation) => ({
                workTopic: attestation.workTopic,
                maximumPoints: attestation.maximumPoints,
                journalId: journal.id,
                workTypeId: (
                  await this.prisma.workType.findUnique({
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
        });
      }

      if (lectureTopics.length > 0) {
        await this.createLessonTopics("Лекция", lectureTopics, journal.id);
      }

      if (practiceTopics.length > 0) {
        await this.createLessonTopics("Практика", practiceTopics, journal.id);
      }

      if (laboratoryTopics.length > 0) {
        await this.createLessonTopics(
          "Лабораторная",
          laboratoryTopics,
          journal.id
        );
      }

      await Promise.all(
        groups.map(async (group) => {
          const subgroup = await this.prisma.subgroup.create({
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
          const students = await this.prisma.student.findMany({
            where: {
              group: {
                name: group,
              },
            },
          });

          await this.prisma.studentsOnSubgroups.createMany({
            data: [
              ...students.map((student) => ({
                studentId: student.id,
                subgroupId: subgroup.id,
              })),
            ],
          });

          await this.prisma.subgroupsOnJournals.create({
            data: {
              journalId: journal.id,
              subgroupId: subgroup.id,
            },
          });
        })
      );
    });
  }

  async getAllList(getJournalListDto?: GetJournalListDto) {
    let where = {} as Prisma.JournalWhereInput;
    if (getJournalListDto) {
      const { userId, deleted, discipline } = getJournalListDto;
      where = {
        userId,
        deleted,
        discipline: {
          name: discipline,
        },
      };
    }
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
      where,
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
            numberOfHours: true,
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
        numberOfHours: lessonTopic.numberOfHours,
      }));
    const practiceTopics = journalUmkInfo.lessonTopics
      .filter((lessonTopic) => lessonTopic.lessonType.name === "Практика")
      .map((practiceTopic) => ({
        id: practiceTopic.id,
        name: practiceTopic.name,
        numberOfHours: practiceTopic.numberOfHours,
      }));
    const laboratoryTopics = journalUmkInfo.lessonTopics
      .filter((lessonTopic) => lessonTopic.lessonType.name === "Лабораторная")
      .map((laboratoryTopic) => ({
        id: laboratoryTopic.id,
        name: laboratoryTopic.name,
        numberOfHours: laboratoryTopic.numberOfHours,
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
            lessonType: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
        attestations: {
          select: {
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
            numberOfHours: true,
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
        workType: attestation.workType.name,
        workTopic: attestation.workTopic,
        maximumPoints: attestation.maximumPoints,
      })),
      lessons: journalFullInfo.lessons.map((lesson) => ({
        id: lesson.id,
        date: lesson.date,
        lessonType: lesson.lessonType.name,
      })),
      lectureTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === "Лекция")
        .map((lessonTopic) => ({
          name: lessonTopic.name,
          numberOfHours: lessonTopic.numberOfHours,
        })),
      practiceTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === "Практика")
        .map((lessonTopic) => ({
          name: lessonTopic.name,
          numberOfHours: lessonTopic.numberOfHours,
        })),
      laboratoryTopics: journalFullInfo.lessonTopics
        .filter((lessonTopic) => lessonTopic.lessonType.name === "Лабораторная")
        .map((lessonTopic) => ({
          name: lessonTopic.name,
          numberOfHours: lessonTopic.numberOfHours,
        })),
    };
  }

  private async createLessonTopics(
    lessonType: string,
    lessonTopics: any[],
    journalId: number
  ) {
    const lessonTypeId = (
      await this.prisma.lessonType.findUnique({
        where: {
          name: lessonType,
        },
      })
    ).id;
    await this.prisma.lessonTopic.createMany({
      data: [
        ...lessonTopics.map((lessonTopic) => ({
          name: lessonTopic.name,
          numberOfHours: lessonTopic.numberOfHours,
          journalId,
          lessonTypeId: lessonTypeId,
        })),
      ],
    });
  }

  private async createGrade(
    minimumPoints: number,
    gradeValue: number,
    journalId: number
  ) {
    await this.prisma.journalsOnGrades.create({
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
  }
}
