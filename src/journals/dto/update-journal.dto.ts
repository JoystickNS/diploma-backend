import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsInt } from "class-validator";
import { CreateJournalDto } from "./create-journal.dto";

export class UpdateJournalDto extends PartialType(CreateJournalDto) {
  @IsInt()
  journalId: number;

  @IsBoolean()
  deleted: boolean;
}
