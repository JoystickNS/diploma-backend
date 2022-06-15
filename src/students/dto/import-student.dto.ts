import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class ImportStudentDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  middleName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  group: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  passportID: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  recordBookID: string;

  @IsOptional()
  @IsInt()
  academ: number;
}
