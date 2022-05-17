import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateAttestationDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly workType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  readonly workTopic?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly maximumPoints?: number;
}
