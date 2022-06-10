import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePointDto } from "./dto/create-point.dto";
import { UpdatePointDto } from "./dto/update-point.dto";

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePointDto) {
    return this.prisma.points.create({
      data: dto,
    });
  }

  async update(dto: UpdatePointDto) {
    const { pointId, numberOfPoints } = dto;
    return this.prisma.points.update({
      data: {
        numberOfPoints,
      },
      where: {
        id: pointId,
      },
    });
  }

  async delete(pointId: number) {
    return this.prisma.points.delete({
      where: {
        id: pointId,
      },
      select: {
        id: true,
      },
    });
  }
}
