import { PartialType } from "@nestjs/mapped-types";
import { IsInt } from "class-validator";
import { CreateAttestationDto } from "./create-attestation.dto";

export class UpdateAttestationDto extends PartialType(CreateAttestationDto) {
  @IsInt()
  attestationId: number;
}
