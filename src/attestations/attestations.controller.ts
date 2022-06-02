import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { AttestationsService } from "./attestations.service";
import { CreateAttestationDto } from "./dto/create-attestation.dto";
import { UpdateAttestationDto } from "./dto/update-attestation.dto";

@WithoutAuthKey()
@Controller()
export class AttestationsController {
  constructor(private readonly attestationsService: AttestationsService) {}

  @Post("journals/:journalId/attestations")
  async create(@Body() dto: CreateAttestationDto) {
    return this.attestationsService.create(dto);
  }

  @Patch("journals/:journalId/attestations/:attestationId")
  async update(@Body() dto: UpdateAttestationDto) {
    return this.attestationsService.update(dto);
  }

  @Delete("journals/:journalId/attestations/:attestationId")
  async delete(@Param("attestationId") attestationId: number) {
    return this.attestationsService.delete(attestationId);
  }
}
