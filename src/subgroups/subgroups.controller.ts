import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AccessSubjectEnum, ActionEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { CreateJournalSubgroupDto } from "./dto/create-journal-subgroup.dto";
import { CreateStudentSubgroup as CreateSubgroupStudent } from "./dto/create-student-subgroup.dto";
import { UpdateManyStudentsSubgroupsDto } from "./dto/update-many-students-subgroup.dto";
import { UpdateStudentSubgroupDto } from "./dto/update-student-subgroup.dto copy";
import { SubgroupsService } from "./subgroups.service";

@Controller("journals")
export class SubgroupsController {
  constructor(private readonly subgroupsService: SubgroupsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/subgroups")
  async createSubgroup(@Body() dto: CreateJournalSubgroupDto) {
    return this.subgroupsService.create(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/subgroups/:subgroupId/students/:studentId")
  async createSubgroupStudent(@Body() dto: CreateSubgroupStudent) {
    return this.subgroupsService.createSubgroupStudent(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/subgroups/:subgroupId/students/:studentId")
  async updateJournalSubgroupStudent(@Body() dto: UpdateStudentSubgroupDto) {
    return this.subgroupsService.updateStudent(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/subgroups/students")
  async updateManyJournalSubgroupsStudents(
    @Body() dto: UpdateManyStudentsSubgroupsDto
  ) {
    return this.subgroupsService.updateManyStudents(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete(":journalId/subgroups/:subgroupId")
  async deleteJournalSubgroup(@Param("subgroupId") subgroupId: number) {
    return this.subgroupsService.delete(subgroupId);
  }
}
