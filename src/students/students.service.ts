import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ImportManyStudentsDto } from "./dto/import-many-students.dro";
import * as bcrypt from "bcrypt";

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async importManyStudents(dto: ImportManyStudentsDto) {
    await this.prisma.$transaction(
      async (prisma) => {
        const groups = dto.students.map((student) => ({
          group: student.group,
          startYear: student.startYear,
        }));

        const uniqueGroups: { group: string; startYear: number }[] = [];

        // Находим список всех групп
        groups.forEach((group) => {
          const foundGroup = uniqueGroups.find(
            (uniqueGroup) => uniqueGroup.group === group.group
          );

          if (!foundGroup) {
            uniqueGroups.push(group);
          }
        });

        // Добавляем новые группы, если появились
        await Promise.all(
          uniqueGroups.map(
            async (uniqueGroup) =>
              await prisma.group.upsert({
                create: {
                  name: uniqueGroup.group,
                  startYear: uniqueGroup.startYear,
                },
                update: {},
                where: {
                  name: uniqueGroup.group,
                },
              })
          )
        );

        await Promise.all(
          dto.students.map(async (student) => {
            // Поиск студента в базе
            const studentInBd = await prisma.student.findUnique({
              where: {
                id: student.id,
              },
              select: {
                statuses: {
                  where: {
                    endDate: null,
                  },
                  select: {
                    studentStatusId: true,
                  },
                },
                groups: {
                  select: {
                    group: {
                      select: {
                        name: true,
                      },
                    },
                  },
                  where: {
                    dateOfDischarge: null,
                  },
                },
                passportID: true,
              },
            });

            // Если такой студент уже есть, то проверяем и обновляем информацию
            if (studentInBd) {
              // Если изменился статус
              if (
                student.academ !==
                studentInBd.statuses[0].studentStatusId - 1
              ) {
                const currentStudentStatusId = (
                  await prisma.studentStatusesOnStudents.findFirst({
                    where: {
                      studentId: student.id,
                      endDate: null,
                    },
                    select: {
                      id: true,
                    },
                  })
                ).id;

                // Обновляем старый статус
                await prisma.studentStatusesOnStudents.update({
                  data: {
                    endDate: new Date().toISOString(),
                  },
                  where: {
                    id: currentStudentStatusId,
                  },
                });

                // Добавляем новый статус
                await prisma.studentStatusesOnStudents.create({
                  data: {
                    studentId: student.id,
                    studentStatusId: student.academ - 1,
                  },
                });
              }

              // Если изменилась группа
              if (student.group !== studentInBd.groups[0].group.name) {
                // Находим старую группу студента
                const studentOnGroupId = (
                  await prisma.studentsOnGroups.findFirst({
                    where: {
                      studentId: student.id,
                      group: {
                        name: student.group,
                      },
                      dateOfDischarge: null,
                    },
                    select: {
                      id: true,
                    },
                  })
                ).id;

                // Обновляем старую группу
                await prisma.studentsOnGroups.update({
                  data: {
                    dateOfDischarge: new Date().toISOString(),
                  },
                  where: {
                    id: studentOnGroupId,
                  },
                });

                // Добавляем новую группу
                await prisma.studentsOnGroups.create({
                  data: {
                    group: {
                      connect: {
                        name: student.group,
                      },
                    },
                    student: {
                      connect: {
                        id: student.id,
                      },
                    },
                  },
                });
              }

              // Если изменился номер паспорта
              const hashedPassportID = await bcrypt.hash(student.passportID, 3);
              if (hashedPassportID !== studentInBd.passportID) {
                await prisma.student.update({
                  data: {
                    passportID: hashedPassportID,
                  },
                  where: {
                    id: student.id,
                  },
                });
              }
            } else {
              // Если такого студента не было, то добавляем его
              // Находим группу студента
              const groupId = (
                await prisma.group.findUnique({
                  where: {
                    name: student.group,
                  },
                  select: {
                    id: true,
                  },
                })
              ).id;

              // Добавляем студента
              await prisma.student.create({
                data: {
                  id: student.id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  middleName: student?.middleName,
                  passportID: student?.passportID,
                  recordBookID: student.recordBookID,
                  groups: {
                    create: {
                      groupId,
                    },
                  },
                  statuses: {
                    create: {
                      studentStatusId: student.academ + 1,
                    },
                  },
                },
              });
            }
          })
        );
      },
      {
        maxWait: 60000,
        timeout: 120000,
      }
    );
  }
}
