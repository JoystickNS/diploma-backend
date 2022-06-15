import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ImportManyStudentsDto } from "./dto/import-many-students.dro";

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async importManyStudents(dto: ImportManyStudentsDto) {
    console.log(dto);
    await this.prisma.$transaction(async (prisma) => {
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
            const newInfo: {
              academId?: number;
              group?: string;
              passportID?: string;
            } = {};

            // Если статус студента изменился
            if (
              student.academ !==
              studentInBd.statuses[0].studentStatusId - 1
            ) {
              newInfo.academId = student.academ + 1;
            }

            if (student.group !== studentInBd.groups[0].group.name) {
              newInfo.group = student.group;
            }

            if (student.passportID !== studentInBd.passportID) {
              newInfo.passportID = student.passportID;
            }

            // if (Object.keys(newInfo).length > 0) {
            //   await prisma.student.update({
            //     data: {
            //       groups: {
            //         connectOrCreate: {
            //           create: {
            //             group: {
            //               connectOrCreate: {
            //                 create: {
            //                   name: newInfo.group,
            //                   startYear: +`20${newInfo.group.match("\b\d{2}\b")}`,
            //                 },
            //                 where: {
            //                   name: newInfo.group,
            //                 },
            //               },
            //             },
            //           },
            //           where: {
            //             id: await prisma.group.findUnique({where: {name: new}})
            //           }
            //         },
            //       },
            //     },
            //   });
            // }
          }
        })
      );
    });
  }
}
