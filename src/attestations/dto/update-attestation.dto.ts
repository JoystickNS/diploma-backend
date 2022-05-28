import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateAttestationDto {
  @IsOptional()
  @IsString()
  workTopic?: string;

  @IsOptional()
  @IsInt()
  maximumPoints?: number;
}
