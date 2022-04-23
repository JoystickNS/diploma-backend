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
