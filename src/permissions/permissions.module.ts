import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";

@Module({
  providers: [PermissionsService],
  exports: [PermissionsService],
  imports: [RolesModule, UsersModule],
})
export class PermissionsModule {}
