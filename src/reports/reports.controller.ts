import { Controller, Get, Query } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @CheckAbilities({
    action: ActionEnum.Read,
    subject: AccessSubjectEnum.Report,
  })
  @Get()
  async getSemesterGroupReport(
    @Query("groupId") groupId: number,
    @Query("semester") semester: number
  ) {
    return this.reportsService.getSemesterGroupReport(groupId, semester);
  }
}
