import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAnnotationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt()
  lessonId: number;
}
