import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateLessonDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @IsOptional()
  @IsDate()
  date?: Date;
}
