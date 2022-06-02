import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateAttestationDto {
  @IsInt()
  readonly journalId: number;

  @IsOptional()
  @IsInt()
  readonly workTypeId: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  readonly workTopic?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly maximumPoints?: number;
}
