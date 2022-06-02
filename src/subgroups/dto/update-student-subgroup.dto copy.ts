import { IsInt, IsOptional } from "class-validator";

export class UpdateStudentSubgroupDto {
  @IsInt()
  readonly studentId: number;

  @IsOptional()
  @IsInt()
  readonly subgroupId?: number;

  @IsInt()
  readonly newSubgroupId: number;
}
