import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAttestationDto } from "./dto/update-attestation.dto";

@Injectable()
export class AttestationsService {
  constructor(private prisma: PrismaService) {}

  async update(attestationId: number, dto: UpdateAttestationDto) {
    const attestation = await this.prisma.attestation.findUnique({
      where: {
        id: attestationId,
      },
    });

    if (!attestation) {
      throw new NotFoundException();
    }

    return this.prisma.attestation.update({
      data: dto,
      where: {
        id: attestationId,
      },
    });
  }
}
