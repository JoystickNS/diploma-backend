import { IsBoolean, IsInt } from "class-validator";

export class UpdateVisitDto {
  @IsInt()
  lessonId: number;

  @IsInt()
  studentId: number;

  @IsBoolean()
  isAbsent: boolean;
}
