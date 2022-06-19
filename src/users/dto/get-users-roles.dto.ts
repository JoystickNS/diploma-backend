import { IsInt, IsOptional, IsString } from "class-validator";

export class GetUsersRolesDto {
  @IsOptional()
  @IsInt()
  readonly skip?: number;

  @IsOptional()
  @IsInt()
  readonly take?: number;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly login?: string;

  @IsOptional()
  @IsString({ each: true })
  readonly roles?: string[];
}
