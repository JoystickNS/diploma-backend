import { IsInt, IsOptional } from "class-validator";

export class CreatePointDto {
  @IsInt()
  studentId: number;

  @IsInt()
  annotationId: number;

  @IsOptional()
  @IsInt()
  numberOfPoints?: number;
}
