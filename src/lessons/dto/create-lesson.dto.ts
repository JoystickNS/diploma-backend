import { IsDate, IsInt, IsOptional } from "class-validator";

export class CreateLessonDto {
  @IsOptional()
  @IsDate()
  date?: Date;

  @IsInt()
  journalId: number;

  @IsInt()
  lessonTopicId: number;
}
