import { Module } from "@nestjs/common";
import { SubgroupsService } from "./subgroups.service";
import { SubgroupsController } from "./subgroups.controller";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  providers: [SubgroupsService],
  controllers: [SubgroupsController],
  imports: [LessonsModule],
})
export class SubgroupsModule {}
