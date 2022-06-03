import { IsInt } from "class-validator";

export class CreateStudentSubgroup {
  @IsInt()
  readonly studentId: number;

  @IsInt()
  readonly subgroupId: number;
}
