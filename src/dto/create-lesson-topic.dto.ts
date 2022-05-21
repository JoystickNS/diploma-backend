import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateLessonTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly name: string;
}
