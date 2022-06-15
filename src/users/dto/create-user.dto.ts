import { IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @Length(6, 30)
  readonly login: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  readonly password?: string;

  @IsString()
  @MaxLength(30)
  readonly firstName: string;

  @IsString()
  @MaxLength(30)
  readonly lastName: string;

  @IsString()
  @MaxLength(30)
  readonly middleName: string;
}
