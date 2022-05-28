import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { TokensModule } from "./tokens/tokens.module";
import { ConfigModule } from "@nestjs/config";
import { RolesModule } from "./roles/roles.module";
import configuration from "./config/configuration";
import { AbilitiesModule } from "./abilities/abilities.module";
import { AbilitiesGuard } from "./abilities/guards/abilities.guard";
import { PermissionsModule } from "./permissions/permissions.module";
import { UsersOnRolesModule } from "./users-on-roles/users-on-roles.module";
import { JournalsModule } from "./journals/journals.module";
import { DisciplinesModule } from "./disciplines/disciplines.module";
import { ControlsModule } from "./controls/controls.module";
import { GroupsModule } from "./groups/groups.module";
import { WorkTypesModule } from "./work-types/work-types.module";
import { LessonsModule } from "./lessons/lessons.module";
import { LessonTypesModule } from "./lesson-types/lesson-types.module";
import { AttestationsModule } from "./attestations/attestations.module";
import { StudentsModule } from "./students/students.module";
import { SubgroupsModule } from "./subgroups/subgroups.module";

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    TokensModule,
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [configuration],
    }),
    RolesModule,
    AbilitiesModule,
    PermissionsModule,
    UsersOnRolesModule,
    JournalsModule,
    DisciplinesModule,
    ControlsModule,
    GroupsModule,
    WorkTypesModule,
    LessonsModule,
    LessonTypesModule,
    AttestationsModule,
    StudentsModule,
    SubgroupsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbilitiesGuard,
    },
  ],
})
export class AppModule {}
