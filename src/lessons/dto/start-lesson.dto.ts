import { IsArray, IsInt } from "class-validator";

export class StartLessonDto {
  @IsArray()
  @IsInt({ each: true })
  subgroupIds: number[];

  @IsInt()
  lessonId: number;
}
