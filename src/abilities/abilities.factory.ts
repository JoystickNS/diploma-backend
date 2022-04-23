import { Ability, AbilityBuilder, AbilityClass } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { ActionEnum, RoleEnum, SubjectEnum } from "@prisma/client";
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
    const userRoles = await this.rolesService.getByUserId(user.id);

    if (!userRoles) {
      return null;
    }

    const rolesNames = userRoles.map((role) => role.role);

    await Promise.all(
      rolesNames.map((role) => this.setAbilities(role, builder))
    );

    return builder.build();
  }

  async setAbilities(role: RoleEnum, builder: AbilityBuilder<AppAbility>) {
    const permissions = await this.permissionsService.getByRole(role);
    const newPermissions = [];

    permissions.forEach((permission) => {
      const isOldPermission = builder.rules.find(
        (rule) =>
          rule.action === permission.action.toLowerCase() &&
          rule.subject === permission.subject
      );

      if (!isOldPermission) {
        newPermissions.push(permission);
      }
    });

    const isManagePermission = newPermissions.find(
      (permission) => permission.action === ActionEnum.Manage
    );

    if (isManagePermission) {
      builder.can(ActionEnum.Manage.toLowerCase(), newPermissions[0].subject);
    } else {
      newPermissions.forEach((permission) =>
        builder.can(permission.action, permission.subject)
      );
    }
  }
}
