import { IsString, MaxLength } from "class-validator";

export class GetStudentsDto {
  @IsString()
  @MaxLength(50)
  group: string;
}
