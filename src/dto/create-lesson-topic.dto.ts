import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateLessonTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly numberOfHours?: number;
}
