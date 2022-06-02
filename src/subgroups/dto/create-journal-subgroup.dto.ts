import { IsInt } from "class-validator";

export class CreateJournalSubgroupDto {
  @IsInt()
  readonly journalId: number;

  @IsInt()
  readonly groupId: number;

  @IsInt()
  readonly subgroup: number;
}
