import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { IAppRequest } from "../interfaces/app-request";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalListDto } from "./dto/get-journal-umk.dto";
import { JournalsService } from "./journals.service";

@Controller("journals")
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  async create(@Req() req: IAppRequest, @Body() dto: CreateJournalDto) {
    return this.journalsService.create(req.user.id, dto);
  }

  @Get()
  async getAllList(@Query() params: GetJournalListDto) {
    return this.journalsService.getAllList(params);
  }

  @Get("my")
  async getAllListByUserId(@Req() req: IAppRequest) {
    return this.journalsService.getAllList({
      userId: req.user.id,
      deleted: false,
    });
  }

  @Get(":journalId/umk-info")
  async getUmkInfoById(@Param("journalId") journalId: number) {
    return this.journalsService.getUmkInfoById(journalId);
  }

  @Get(":journalId/full-info")
  async getFullInfo(@Param("journalId") journalId: number) {
    return this.journalsService.getJournalFullInfo(journalId);
  }
}
