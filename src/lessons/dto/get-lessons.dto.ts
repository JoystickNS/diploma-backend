import { IsInt } from "class-validator";

export class GetLessonsDto {
  @IsInt()
  journalId: number;
}
