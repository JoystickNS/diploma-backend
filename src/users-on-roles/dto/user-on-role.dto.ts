import { IsInt } from "class-validator";

export class UserOnRoleDto {
  @IsInt()
  readonly userId: number;

  @IsInt()
  readonly roleId: number;
}
