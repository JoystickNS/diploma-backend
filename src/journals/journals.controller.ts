import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { ActionEnum, AccessObjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { IAppRequest } from "../interfaces/app-request";
import { CreateLessonDto } from "../lessons/dto/create-lesson.dto";
import { CreateManyLessonsDto } from "../lessons/dto/create-many-lessons.dto";
import { LessonsService } from "../lessons/lessons.service";
import { CreateJournalSubgroupDto } from "../subgroups/dto/create-journal-subgroup.dto";
import { UpdateManyStudentsSubgroupsDto as UpdateManyStudentsSubgroupsDto } from "../subgroups/dto/update-many-students-subgroup.dto";
import { UpdateStudentSubgroupDto } from "../subgroups/dto/update-student-subgroup.dto copy";
import { SubgroupsService } from "../subgroups/subgroups.service";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { GetJournalListDto } from "./dto/get-journal-umk.dto";
import { JournalsService } from "./journals.service";

@Controller("journals")
export class JournalsController {
  constructor(
    private readonly journalsService: JournalsService,
    private readonly lessonsService: LessonsService,
    private readonly subgroupsService: SubgroupsService
  ) {}

  @Post()
  async create(@Req() req: IAppRequest, @Body() dto: CreateJournalDto) {
    return this.journalsService.create(req.user.id, dto);
  }

  @Post(":journalId/subgroups")
  async createSubgroup(@Body() dto: CreateJournalSubgroupDto) {
    return this.subgroupsService.createJournalSubgroup(dto);
  }

  @Post(":journalId/lessons/subgroups/:subgroupId")
  async createLesson(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Post(":journalId/lessons/crate-many")
  async createManyLessons(@Body() dto: CreateManyLessonsDto) {
    return this.lessonsService.createMany(dto);
  }

  @WithoutAuthKey()
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

  @CheckAbilities({ action: ActionEnum.Read, object: AccessObjectEnum.Journal })
  @Get(":journalId/full-info")
  async getFullInfo(@Param("journalId") journalId: number) {
    return this.journalsService.getJournalFullInfo(journalId);
  }

  @Get(":journalId/lessons")
  async getLessons(@Param("journalId") journalId: number) {
    return this.lessonsService.get({ journalId });
  }

  // @Put(":journalId/lessons/:lessonId")
  // async updateLesson(@Param() params) {
  //   const { journalId, lessonId } = params;
  //   return this.lessonsService.updateOne({})
  // }

  @Put(":journalId/subgroups/:subgroupId/students/:studentId")
  async updateJournalSubgroupStudent(@Body() dto: UpdateStudentSubgroupDto) {
    return this.subgroupsService.updateStudentSubgroup(dto);
  }

  @Put(":journalId/subgroups/students")
  async updateManyJournalSubgroupsStudents(
    @Body() dto: UpdateManyStudentsSubgroupsDto
  ) {
    return this.subgroupsService.updateManyStudentsSubgroups(dto);
  }

  @Delete(":journalId/subgroups/:subgroupId")
  async deleteJournalSubgroup(@Param("subgroupId") subgroupId: number) {
    return this.subgroupsService.deleteJournalSubgroup(subgroupId);
  }
}
