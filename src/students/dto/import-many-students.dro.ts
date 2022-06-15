import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { ImportStudentDto } from "./import-student.dto";

export class ImportManyStudentsDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ImportStudentDto)
  students: ImportStudentDto[];
}
