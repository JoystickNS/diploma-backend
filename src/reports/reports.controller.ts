import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getSemesterGroupReport(
    @Query("groupId") groupId: number,
    @Query("semester") semester: number
  ) {
    return this.reportsService.getSemesterGroupReport(groupId, semester);
  }
}
