import { RoleEnum } from "@prisma/client";
import { IsEnum, IsInt } from "class-validator";

export class DeleteRoleByUserIdDto {
  @IsInt()
  userId: number;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
