import { IsInt, IsOptional, IsString } from "class-validator";

export class GetUsersRolesDto {
  @IsOptional()
  @IsInt()
  skip: number;

  @IsOptional()
  @IsInt()
  take: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  login: string;

  @IsOptional()
  @IsString({ each: true })
  roles: string[];
}
