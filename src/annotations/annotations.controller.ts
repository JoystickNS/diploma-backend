import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AnnotationsService } from "./annotations.service";
import { CreateAnnotationDto } from "./dto/create-annotation.dto";
import { UpdateAnnotationDto } from "./dto/update-annotation.dto";

@Controller("journals")
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post(":journalId/lessons/:lessonId/annotations")
  async create(@Body() dto: CreateAnnotationDto) {
    return this.annotationsService.create(dto);
  }

  @Patch(":journalId/lessons/:lessonId/annotations/:annotationId")
  async update(@Body() dto: UpdateAnnotationDto) {
    return this.annotationsService.update(dto);
  }

  @Delete(":journalId/lessons/:lessonId/annotations/:annotationId")
  async delete(@Param("annotationId") annotationId: number) {
    return this.annotationsService.delete(annotationId);
  }
}
