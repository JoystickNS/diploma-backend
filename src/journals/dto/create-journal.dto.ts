import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  IsDefined,
  IsArray,
  IsString,
} from "class-validator";
import { CreateAttestationDto } from "../../attestations/dto/create-attestation.dto";

export class CreateJournalDto {
  @IsInt()
  readonly groupId: number;

  @IsInt()
  readonly disciplineId: number;

  @IsInt()
  readonly controlId: number;

  @IsInt()
  @Min(0)
  readonly lectureHours: number;

  @IsInt()
  @Min(0)
  readonly practiceHours: number;

  @IsInt()
  @Min(0)
  readonly laboratoryHours: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly pointsForThree?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly pointsForFour?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly pointsForFive?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly maximumPoints?: number;

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateAttestationDto)
  readonly attestations: CreateAttestationDto[];

  @IsArray()
  @IsString({ each: true })
  readonly lectureTopics: string[];

  @IsArray()
  @IsString({ each: true })
  readonly practiceTopics: string[];

  @IsArray()
  @IsString({ each: true })
  readonly laboratoryTopics: string[];
}
