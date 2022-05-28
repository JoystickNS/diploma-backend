import { Body, Controller, Param, Put } from "@nestjs/common";
import { AttestationsService } from "./attestations.service";
import { UpdateAttestationDto } from "./dto/update-attestation.dto";

@Controller("attestations")
export class AttestationsController {
  constructor(private readonly attestationsService: AttestationsService) {}

  @Put(":attestationId")
  async update(
    @Param("attestationId") attestationId: number,
    @Body() dto: UpdateAttestationDto
  ) {
    return this.attestationsService.update(attestationId, dto);
  }
}
