import { Module } from "@nestjs/common";
import { JournalsService } from "./journals.service";
import { JournalsController } from "./journals.controller";
import { StudentsModule } from "../students/students.module";
import { LessonsModule } from "../lessons/lessons.module";
import { SubgroupsModule } from "../subgroups/subgroups.module";

@Module({
  controllers: [JournalsController],
  providers: [JournalsService],
  exports: [JournalsService],
  imports: [StudentsModule, LessonsModule, SubgroupsModule],
})
export class JournalsModule {}
