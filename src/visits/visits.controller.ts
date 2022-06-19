import { Body, Controller, Patch } from "@nestjs/common";
import { AccessSubjectEnum, ActionEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { VisitsService } from "./visits.service";

@Controller("journals")
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/lessons/:lessonId/students/:studentId/visits")
  async update(@Body() dto: UpdateVisitDto) {
    return this.visitsService.update(dto);
  }
}
