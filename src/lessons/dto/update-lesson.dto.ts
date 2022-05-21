import { PickType } from "@nestjs/mapped-types";
import { IsInt } from "class-validator";
import { CreateLessonDto } from "./create-lesson.dto";

export class UpdateLessonDto extends PickType(CreateLessonDto, [
  "date",
] as const) {
  @IsInt()
  id: number;
}
