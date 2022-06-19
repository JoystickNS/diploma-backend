import { Body, Controller, Post } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { ImportManyStudentsDto } from "./dto/import-many-students.dro";
import { StudentsService } from "./students.service";

@WithoutAuthKey()
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post()
  async importManyStudents(@Body() dto: ImportManyStudentsDto) {
    return this.studentsService.importManyStudents(dto);
  }
}
