import { Controller, Get, NotFoundException } from "@nestjs/common";
import { GroupsService } from "./groups.service";

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
