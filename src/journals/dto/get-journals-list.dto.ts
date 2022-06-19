import { IsInt, IsOptional } from "class-validator";

export class GetJournalsListDto {
  @IsOptional()
  @IsInt()
  readonly skip?: number;

  @IsOptional()
  @IsInt()
  readonly take?: number;

  @IsOptional()
  @IsInt()
  readonly disciplineId?: number;

  @IsOptional()
  @IsInt()
  readonly groupId?: number;

  @IsOptional()
  @IsInt()
  readonly userId?: number;
}
