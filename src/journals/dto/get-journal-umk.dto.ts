import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class GetJournalListDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsOptional()
  @IsString()
  discipline?: string;
}
