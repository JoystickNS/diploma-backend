import { Module } from "@nestjs/common";
import { JournalsService } from "./journals.service";
import { JournalsController } from "./journals.controller";
import { SubgroupsModule } from "../subgroups/subgroups.module";

@Module({
  controllers: [JournalsController],
  providers: [JournalsService],
  imports: [SubgroupsModule],
})
export class JournalsModule {}
