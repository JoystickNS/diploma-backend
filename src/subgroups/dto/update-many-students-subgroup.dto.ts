import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { UpdateStudentSubgroupDto } from "./update-student-subgroup.dto copy";

export class UpdateManyStudentsSubgroupsDto {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentSubgroupDto)
  items: UpdateStudentSubgroupDto[];
}
