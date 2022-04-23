import { Ability, AbilityBuilder, AbilityClass } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { ActionEnum, SubjectEnum } from "@prisma/client";
import { JwtPayload } from "../classes/jwt-payload";
import { PermissionsService } from "../permissions/permissions.service";
import { RolesService } from "../roles/roles.service";

type AppSubjects = SubjectEnum | "all";

export type AppAbility = Ability<[ActionEnum | string, AppSubjects]>;

@Injectable()
export class AbilitiesFactory {
  constructor(
    private permissionsService: PermissionsService,
    private rolesService: RolesService
  ) {}

  async defineAbilities(user: JwtPayload) {
    const builder = new AbilityBuilder(Ability as AbilityClass<AppAbility>);
    const roles = await this.rolesService.getByUserId(user.id);

    if (roles) {
      const permissions = await this.permissionsService.getByRoles(roles);

      permissions.forEach((permission) =>
        builder.can(permission.action.toLowerCase(), permission.subject)
      );
    }

    return builder.build();
  }
}
