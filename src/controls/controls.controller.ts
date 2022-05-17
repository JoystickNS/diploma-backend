import { Controller, Get } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { ControlsService } from "./controls.service";

@WithoutAuthKey()
@Controller("controls")
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Get()
  async getAll() {
    return this.controlsService.getAll();
  }
}
