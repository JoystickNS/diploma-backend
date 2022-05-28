import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  Min,
  IsString,
  ValidateNested,
  MaxLength,
  IsDefined,
} from "class-validator";
import { CreateAttestationDto } from "../../dto/create-attestation.dto";
import { CreateLessonTopicDto } from "../../dto/create-lesson-topic.dto";

export class CreateJournalDto {
  @IsString()
  @MaxLength(50)
  readonly group: string;

  @IsString()
  @MaxLength(150)
  readonly discipline: string;

  @IsString()
  @MaxLength(50)
  readonly control: string;

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

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly lectureTopics: CreateLessonTopicDto[];

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly practiceTopics: CreateLessonTopicDto[];

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly laboratoryTopics: CreateLessonTopicDto[];
}
