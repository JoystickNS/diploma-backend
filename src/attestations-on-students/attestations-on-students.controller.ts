import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AttestationsOnStudentsService } from "./attestations-on-students.service";
import { CreateAttestationsOnStudentsDto } from "./dto/create-attestations-on-students.dto";
import { UpdateAttestationsOnStudentsDto } from "./dto/update-attestations-on-students.dto";

@Controller("journals")
export class AttestationsOnStudentsController {
  constructor(
    private readonly attestationsOnStudentsService: AttestationsOnStudentsService
  ) {}

  @Post(":journalId/attestations/:attestationId/students/:studentId")
  async create(@Body() dto: CreateAttestationsOnStudentsDto) {
    return this.attestationsOnStudentsService.create(dto);
  }

  @Patch(":journalId/attestations/:attestationId/students/:studentId")
  async update(@Body() dto: UpdateAttestationsOnStudentsDto) {
    return this.attestationsOnStudentsService.update(dto);
  }

  @Delete(":journalId/attestations/:attestationId/students/:studentId")
  async delete(
    @Param("attestationId") attestationId: number,
    @Param("studentId") studentId: number
  ) {
    return this.attestationsOnStudentsService.delete(attestationId, studentId);
  }
}
