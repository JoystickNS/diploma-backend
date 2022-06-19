import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ActionEnum, AccessSubjectEnum } from "@prisma/client";
import { CheckAbilities } from "../abilities/decorators/check-abilities.decorator";
import { AnnotationsService } from "./annotations.service";
import { CreateAnnotationDto } from "./dto/create-annotation.dto";
import { UpdateAnnotationDto } from "./dto/update-annotation.dto";

@Controller("journals")
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @CheckAbilities({
    action: ActionEnum.Create,
    subject: AccessSubjectEnum.Journal,
  })
  @Post(":journalId/lessons/:lessonId/annotations")
  async create(@Body() dto: CreateAnnotationDto) {
    return this.annotationsService.create(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Update,
    subject: AccessSubjectEnum.Journal,
  })
  @Patch(":journalId/lessons/:lessonId/annotations/:annotationId")
  async update(@Body() dto: UpdateAnnotationDto) {
    return this.annotationsService.update(dto);
  }

  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: AccessSubjectEnum.Journal,
  })
  @Delete(":journalId/lessons/:lessonId/annotations/:annotationId")
  async delete(@Param("annotationId") annotationId: number) {
    return this.annotationsService.delete(annotationId);
  }
}
