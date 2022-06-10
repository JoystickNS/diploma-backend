import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { AbilitiesFactory } from "./abilities.factory";

@Module({
  providers: [AbilitiesFactory],
  exports: [AbilitiesFactory],
  imports: [PermissionsModule],
})
export class AbilitiesModule {}
