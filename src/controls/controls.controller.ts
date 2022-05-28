import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { ControlsService } from "./controls.service";

@WithoutAuthKey()
@Controller("controls")
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Get()
  async getAll() {
    const controls = await this.controlsService.getAll();

    if (controls.length === 0) {
      throw new NotFoundException();
    }

    return controls;
  }
}
