import { IsInt } from "class-validator";

export class UpdateStudentSubgroupDto {
  @IsInt()
  studentId: number;

  @IsInt()
  subgroupId: number;

  @IsInt()
  newSubgroupId: number;
}
