import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class ImportStudentDto {
  @IsInt()
  readonly id: number;

  @IsString()
  @MaxLength(30)
  readonly lastName: string;

  @IsString()
  @MaxLength(30)
  readonly firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly middleName: string;

  @IsString()
  @MaxLength(50)
  readonly group: string;

  @IsString()
  @MaxLength(6)
  readonly recordBookID: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly passportID: string;

  @IsInt()
  readonly academ: number;

  @IsInt()
  readonly startYear: number;
}
