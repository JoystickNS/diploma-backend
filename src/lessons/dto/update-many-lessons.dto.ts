import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { UpdateLessonDto } from "./update-lesson.dto";

export class UpdateManyLessonsDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  lessons: UpdateLessonDto[];
}
