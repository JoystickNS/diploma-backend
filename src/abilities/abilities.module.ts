import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { RolesModule } from "../roles/roles.module";
import { AbilitiesFactory } from "./abilities.factory";

@Module({
  providers: [AbilitiesFactory],
  exports: [AbilitiesFactory],
  imports: [PermissionsModule, RolesModule],
})
export class AbilitiesModule {}
