import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { CreatePointDto } from "./dto/create-point.dto";
import { UpdatePointDto } from "./dto/update-point.dto";
import { PointsService } from "./points.service";

@Controller("journals")
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post(":journalId/lessons/:lessonId/students/:studentId/points")
  async create(@Body() dto: CreatePointDto) {
    return this.pointsService.create(dto);
  }

  @Patch(":journalId/lessons/:lessonId/students/:studentId/points/:pointId")
  async update(@Body() dto: UpdatePointDto) {
    return this.pointsService.update(dto);
  }

  @Delete(":journalId/lessons/:lessonId/students/:studentId/points/:pointId")
  async delete(@Param("pointId") pointId: number) {
    return this.pointsService.delete(pointId);
  }
}
