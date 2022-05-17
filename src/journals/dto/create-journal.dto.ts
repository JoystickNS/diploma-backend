import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  IsString,
  ValidateNested,
  MaxLength,
} from "class-validator";
import { CreateAttestationDto } from "../../dto/create-attestation.dto";
import { CreateLessonTopicDto } from "../../dto/create-lesson-topic.dto";

export class CreateJournalDto {
  @IsArray()
  @Type(() => String)
  readonly groups: string[];

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

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttestationDto)
  readonly attestations?: CreateAttestationDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly lectureTopics?: CreateLessonTopicDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly practiceTopics?: CreateLessonTopicDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonTopicDto)
  readonly laboratoryTopics?: CreateLessonTopicDto[];
}
