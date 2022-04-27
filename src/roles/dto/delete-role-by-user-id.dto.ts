import { IsInt } from "class-validator";

export class DeleteRoleByUserIdDto {
  @IsInt()
  userId: number;

  @IsInt()
  roleId: number;
}
