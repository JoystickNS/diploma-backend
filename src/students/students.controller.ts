import { Controller, Get, Query } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { GetStudentsDto } from "./dto/get-students.dto";
import { StudentsService } from "./students.service";

@WithoutAuthKey()
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get() // FIXME: delete later
  async get(@Query() params: GetStudentsDto) {
    return this.studentsService.get(params);
  }
}
