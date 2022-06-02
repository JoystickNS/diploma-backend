import { IsArray, IsDate, IsInt, IsOptional, IsString } from "class-validator";

export class CreateLessonDto {
  @IsInt()
  readonly journalId: number;

  @IsInt()
  readonly lessonTypeId: number;

  @IsOptional()
  @IsString()
  readonly lessonTopic?: string;

  @IsArray()
  @IsInt({ each: true })
  readonly subgroupIds: number[];

  @IsDate()
  readonly date: Date;
}
