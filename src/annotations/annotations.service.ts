import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAnnotationDto } from "./dto/create-annotation.dto";
import { UpdateAnnotationDto } from "./dto/update-annotation.dto";

@Injectable()
export class AnnotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAnnotationDto) {
    return this.prisma.annotation.create({
      data: dto,
    });
  }

  async update(dto: UpdateAnnotationDto) {
    const { annotationId, name } = dto;
    return this.prisma.annotation.update({
      data: {
        name,
      },
      where: {
        id: annotationId,
      },
    });
  }

  async delete(annotationId: number) {
    return this.prisma.annotation.delete({
      where: {
        id: annotationId,
      },
      select: {
        id: true,
      },
    });
  }
}
