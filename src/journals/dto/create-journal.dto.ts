import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  IsDefined,
  IsArray,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateJournalDto {
  @IsInt()
  readonly groupId: number;

  @IsInt()
  readonly disciplineId: number;

  @IsInt()
  readonly controlId: number;

  @IsInt()
  readonly semester: number;

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
  @Type(() => CreateAttestation)
  readonly attestations: CreateAttestation[];

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

class CreateAttestation {
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
