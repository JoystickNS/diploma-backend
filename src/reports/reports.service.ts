import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSemesterGroupReport(groupId: number, semester: number) {
    const journals = await this.prisma.journal.findMany({
      where: {
        semester,
        subgroups: {
          every: {
            subgroup: {
              groupId,
            },
          },
        },
      },
      select: {
        id: true,
        discipline: true,
      },
    });

    const students = await this.prisma.student.findMany({
      where: {
        groups: {
          every: {
            groupId,
            dateOfDischarge: null,
          },
        },
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        middleName: true,
      },
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
        {
          middleName: "asc",
        },
      ],
    });

    const result = {
      disciplines: journals.map((journal) => ({
        ...journal.discipline,
      })),
      group: (
        await this.prisma.group.findUnique({
          where: {
            id: groupId,
          },
          select: {
            name: true,
          },
        })
      ).name,
      semester,
      students: [],
    };

    await Promise.all(
      students.map(async (student, i) => {
        const temp = {
          id: student.id,
          lastName: student.lastName,
          firstName: student.firstName,
          middleName: student.middleName,
          performances: [],
        };

        await Promise.all(
          journals.map(async (journal, j) => {
            const performance = {
              disciplineId: journal.discipline.id,
              absenteeismCount: 0,
              pointsCount: 0,
            };

            performance.absenteeismCount = (
              await this.prisma.visit.findMany({
                where: {
                  isAbsent: true,
                  lesson: {
                    journalId: journal.id,
                  },
                  studentId: student.id,
                },
              })
            ).length;

            performance.pointsCount = (
              await this.prisma.points.aggregate({
                _sum: {
                  numberOfPoints: true,
                },
                where: {
                  annotation: {
                    lesson: {
                      journalId: journal.id,
                    },
                  },
                  studentId: student.id,
                },
              })
            )._sum.numberOfPoints;

            performance.pointsCount = performance.pointsCount
              ? performance.pointsCount
              : 0;

            temp.performances[j] = performance;
          })
        );

        result.students[i] = temp;
      })
    );

    return result;
  }
}
