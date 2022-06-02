import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { CreateLessonDto } from "./create-lesson.dto";

export class CreateManyLessonsDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  readonly items: CreateLessonDto[];
}
