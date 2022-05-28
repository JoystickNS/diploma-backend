import { ForbiddenError, subject } from "@casl/ability";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccessObjectEnum, ActionEnum, Journal } from "@prisma/client";
import { ExceptionMessages } from "../../constants/exception-messages";
import { PrismaService } from "../../prisma/prisma.service";
import { AbilitiesFactory } from "../abilities.factory";
import { CHECK_ABILITIES } from "../decorators/check-abilities.decorator";
import { IRequiredRule } from "../interfaces/required-rule.interface";

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: AbilitiesFactory,
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
    let journal: Journal;

    if (params.journalId) {
      journal = await this.prisma.journal.findUnique({
        where: {
          id: +params.journalId,
        },
      });
    }

    try {
      requiredRules.forEach((rule) => {
        if (rule.object === AccessObjectEnum.Journal) {
          ForbiddenError.from(ability)
            .setMessage("Вы можете просматривать только свои журналы")
            .throwUnlessCan(rule.action, subject("Journal", journal));
        } else {
          ForbiddenError.from(ability)
            .setMessage("Нет доступа")
            .throwUnlessCan(rule.action, "Permission");
        }
      });

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
