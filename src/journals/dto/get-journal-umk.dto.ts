import { IsBoolean, IsInt, IsOptional } from "class-validator";

export class GetJournalListDto {
  @IsOptional()
  @IsInt()
  readonly userId?: number;

  @IsOptional()
  @IsBoolean()
  readonly deleted?: boolean;

  @IsOptional()
  @IsInt()
  readonly disciplineId?: number;
}
