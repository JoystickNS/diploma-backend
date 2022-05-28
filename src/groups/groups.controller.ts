import { Controller, Get, NotFoundException } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { GroupsService } from "./groups.service";

@WithoutAuthKey()
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getAll() {
    const groups = await this.groupsService.getAll();

    if (!groups) {
      throw new NotFoundException();
    }

    return groups;
  }
}
