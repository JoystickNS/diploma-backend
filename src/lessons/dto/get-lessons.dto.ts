import { IsInt } from "class-validator";

export class GetLessonsDto {
  @IsInt()
  readonly journalId: number;
}
