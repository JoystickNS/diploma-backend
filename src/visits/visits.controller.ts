import { Body, Controller, Patch } from "@nestjs/common";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { VisitsService } from "./visits.service";

@Controller("journals")
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Patch(":journalId/lessons/:lessonId/students/:studentId/visits")
  async update(@Body() dto: UpdateVisitDto) {
    return this.visitsService.update(dto);
  }
}
