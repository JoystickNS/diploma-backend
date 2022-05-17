import { Module } from "@nestjs/common";
import { SubgroupsService } from "./subgroups.service";

@Module({
  providers: [SubgroupsService],
  exports: [SubgroupsService],
})
export class SubgroupsModule {}
