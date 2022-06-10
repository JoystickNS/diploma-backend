import { PickType } from "@nestjs/mapped-types";
import { IsInt } from "class-validator";
import { CreatePointDto } from "./create-point.dto";

export class UpdatePointDto extends PickType(CreatePointDto, [
  "numberOfPoints",
] as const) {
  @IsInt()
  pointId: number;
}
