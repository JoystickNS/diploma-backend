import { Module } from "@nestjs/common";
import { ControlsService } from "./controls.service";
import { ControlsController } from "./controls.controller";

@Module({
  controllers: [ControlsController],
  providers: [ControlsService],
})
export class ControlsModule {}
