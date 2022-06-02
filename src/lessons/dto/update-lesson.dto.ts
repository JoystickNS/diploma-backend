import { PartialType } from "@nestjs/mapped-types";
import { IsInt } from "class-validator";
import { CreateLessonDto } from "./create-lesson.dto";

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsInt()
  readonly lessonId: number;
}
