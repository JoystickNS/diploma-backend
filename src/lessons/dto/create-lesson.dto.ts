import { IsDate, IsInt, IsOptional } from "class-validator";

export class CreateLessonDto {
  @IsInt()
  journalId: number;

  @IsInt()
  subgroupId: number;

  @IsDate()
  date: Date;
}
