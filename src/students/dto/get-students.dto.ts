import { IsInt } from "class-validator";

export class GetStudentsDto {
  @IsInt()
  readonly groupId: number;
}
