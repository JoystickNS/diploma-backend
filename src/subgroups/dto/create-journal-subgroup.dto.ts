import { IsInt, IsString, MaxLength } from "class-validator";

export class CreateJournalSubgroupDto {
  @IsInt()
  journalId: number;

  @IsString()
  @MaxLength(50)
  group: string;

  @IsInt()
  subgroup: number;
}
