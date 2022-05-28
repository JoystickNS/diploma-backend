import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
  imports: [RolesModule, UsersModule],
})
export class PermissionsModule {}
