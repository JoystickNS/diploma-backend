import { Module } from "@nestjs/common";
import { LessonTypesService } from "./lesson-types.service";
import { LessonTypesController } from "./lesson-types.controller";

@Module({
  controllers: [LessonTypesController],
  providers: [LessonTypesService],
})
export class LessonTypesModule {}
