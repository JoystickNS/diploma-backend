import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { IAppRequest } from "../interfaces/app-request";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalsListDto } from "./dto/get-journals-list.dto";
import { UpdateJournalDto } from "./dto/update-journal.dto";
import { JournalsService } from "./journals.service";

@Controller("journals")
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post()
  async create(@Req() req: IAppRequest, @Body() dto: CreateJournalDto) {
    return this.journalsService.create(req.user.id, dto);
  }

  @Get()
  async getAllList(@Query() params: GetJournalsListDto) {
    return this.journalsService.getAllList(params);
  }

  @Get("my")
  async getMyList(@Req() req: IAppRequest, @Query() dto: GetJournalsListDto) {
    return this.journalsService.getMyList(req.user.id, dto);
  }

  @CheckAbilities({
    action: ActionEnum.Read,
    subject: AccessSubjectEnum.Journal,
  })
  @Get(":journalId/umk-info")
  async getUmkInfoById(@Param("journalId") journalId: number) {
    return this.journalsService.getUmkInfoById(journalId);
  }

  @CheckAbilities({
    action: ActionEnum.Read,
    subject: AccessSubjectEnum.Journal,
  })
  @Get(":journalId/full-info")
  async getFullInfo(@Param("journalId") journalId: number) {
    return this.journalsService.getJournalFullInfo(journalId);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId")
  async update(@Body() dto: UpdateJournalDto) {
    return this.journalsService.update(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete(":journalId")
  async delete(@Param("journalId") journalId: number) {
    return this.journalsService.delete(journalId);
  }
}
