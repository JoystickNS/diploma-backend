import { Module } from "@nestjs/common";
import { UsersOnRolesService } from "./users-on-roles.service";
import { UsersOnRolesController } from "./users-on-roles.controller";

@Module({
  controllers: [UsersOnRolesController],
  providers: [UsersOnRolesService],
})
export class UsersOnRolesModule {}
