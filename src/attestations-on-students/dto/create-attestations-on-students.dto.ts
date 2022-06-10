import { IsInt, IsOptional, IsBoolean } from "class-validator";

export class CreateAttestationsOnStudentsDto {
  @IsInt()
  readonly attestationId: number;

  @IsInt()
  readonly studentId: number;

  @IsOptional()
  @IsBoolean()
  readonly credited?: boolean;

  @IsOptional()
  @IsInt()
  readonly points?: number;

  @IsOptional()
  @IsInt()
  readonly grade?: number;
}
