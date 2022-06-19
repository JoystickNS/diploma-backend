import { ForbiddenError, subject } from "@casl/ability";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccessSubjectEnum, ActionEnum, RoleEnum } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { RolesService } from "../../roles/roles.service";
import { AbilitiesFactory } from "../abilities.factory";
import { CHECK_ABILITIES } from "../decorators/check-abilities.decorator";
import { IRequiredRule } from "../interfaces/required-rule.interface";

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: AbilitiesFactory,
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRules =
      this.reflector.get<IRequiredRule[]>(
        CHECK_ABILITIES,
        context.getHandler()
      ) || [];

    if (requiredRules.length === 0) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();
    const ability = await this.caslAbilityFactory.defineAbilities(user);

    let journal;
    let userRoles;

    if (
      requiredRules.find(
        (requiredRule) => requiredRule.subject === AccessSubjectEnum.Journal
      )
    ) {
      if (
        !requiredRules.find(
          (requiredRule) => requiredRule.action === ActionEnum.Create
        )
      ) {
        journal = await this.prisma.journal.findUnique({
          where: {
            id: +params.journalId,
          },
        });
      }

      userRoles = await this.rolesService.getByUserId(user.id);
    }

    try {
      requiredRules.forEach((rule) => {
        if (rule.subject === AccessSubjectEnum.Journal) {
          // Выдача прав нап чтение руководителю
          if (
            rule.action === ActionEnum.Read &&
            userRoles.find((userRole) => userRole === RoleEnum.Manager)
          ) {
            ForbiddenError.from(ability).throwUnlessCan(
              rule.action,
              rule.subject
            );
          } else if (rule.action === ActionEnum.Create) {
            ForbiddenError.from(ability).throwUnlessCan(
              rule.action,
              rule.subject
            );
          } else {
            ForbiddenError.from(ability).throwUnlessCan(
              rule.action,
              subject("Journal", journal)
            );
          }
        } else {
          ForbiddenError.from(ability).throwUnlessCan(
            rule.action,
            rule.subject
          );
        }
      });

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException();
      }
    }

    return true;
  }
}
