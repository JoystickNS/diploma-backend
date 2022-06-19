import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { CreatePointDto } from "./dto/create-point.dto";
import { UpdatePointDto } from "./dto/update-point.dto";
import { PointsService } from "./points.service";

@Controller("journals")
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/lessons/:lessonId/students/:studentId/points")
  async create(@Body() dto: CreatePointDto) {
    return this.pointsService.create(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/lessons/:lessonId/students/:studentId/points/:pointId")
  async update(@Body() dto: UpdatePointDto) {
    return this.pointsService.update(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete(":journalId/lessons/:lessonId/students/:studentId/points/:pointId")
  async delete(@Param("pointId") pointId: number) {
    return this.pointsService.delete(pointId);
  }
}
