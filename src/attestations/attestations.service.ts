import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttestationDto } from "./dto/create-attestation.dto";
import { UpdateAttestationDto } from "./dto/update-attestation.dto";

@Injectable()
export class AttestationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttestationDto) {
    return this.prisma.attestation.create({
      data: dto,
      select: {
        id: true,
        workType: true,
        workTopic: true,
        maximumPoints: true,
      },
    });
  }

  async update(dto: UpdateAttestationDto) {
    const { maximumPoints, workTopic, workTypeId } = dto;
    return this.prisma.attestation.update({
      data: {
        maximumPoints,
        workTopic,
        workTypeId,
      },
      where: {
        id: dto.attestationId,
      },
      select: {
        id: true,
        workType: true,
        workTopic: true,
        maximumPoints: true,
      },
    });
  }

  async delete(attestationId: number) {
    return this.prisma.attestation.delete({
      where: {
        id: attestationId,
      },
      select: {
        id: true,
      },
    });
  }
}
