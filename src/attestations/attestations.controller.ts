import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { AttestationsService } from "./attestations.service";
import { CreateAttestationDto } from "./dto/create-attestation.dto";
import { UpdateAttestationDto } from "./dto/update-attestation.dto";

@Controller()
export class AttestationsController {
  constructor(private readonly attestationsService: AttestationsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post("journals/:journalId/attestations")
  async create(@Body() dto: CreateAttestationDto) {
    return this.attestationsService.create(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch("journals/:journalId/attestations/:attestationId")
  async update(@Body() dto: UpdateAttestationDto) {
    return this.attestationsService.update(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete("journals/:journalId/attestations/:attestationId")
  async delete(@Param("attestationId") attestationId: number) {
    return this.attestationsService.delete(attestationId);
  }
}
