import { IsDate, IsInt } from "class-validator";

export class CreateLessonDto {
  @IsDate()
  date: Date;

  @IsInt()
  journalId: number;

  @IsInt()
  lessonTypeId: number;
}
