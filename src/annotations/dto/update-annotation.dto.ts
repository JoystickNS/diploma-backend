import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsInt } from "class-validator";
import { CreateAnnotationDto } from "./create-annotation.dto";

export class UpdateAnnotationDto extends PickType(CreateAnnotationDto, [
  "name",
] as const) {
  @IsInt()
  annotationId: number;
}
