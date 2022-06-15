import { Body, Controller, Post } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { ImportManyStudentsDto } from "./dto/import-many-students.dro";
import { StudentsService } from "./students.service";

@WithoutAuthKey()
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async importManyStudents(@Body() dto: ImportManyStudentsDto) {
    return this.studentsService.importManyStudents(dto);
  }
}
