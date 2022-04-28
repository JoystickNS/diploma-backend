import { IsInt } from "class-validator";

export class UserOnRoleDto {
  @IsInt()
  userId: number;

  @IsInt()
  roleId: number;
}
