import { ForbiddenError } from "@casl/ability";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExceptionMessages } from "../../constants/exception-messages";
import { AbilitiesFactory } from "../abilities.factory";
import { CHECK_ABILITIES } from "../decorators/check-abilities.decorator";
import { IRequiredRule } from "../interfaces/required-rule.interface";

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilitiesFactory
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

    const { user } = context.switchToHttp().getRequest();
    const ability = await this.caslAbilityFactory.defineAbilities(user);

    try {
      requiredRules.forEach((rule) => {
        ForbiddenError.from(ability)
          .setMessage(ExceptionMessages.Forbidden)
          .throwUnlessCan(rule.action, rule.subject);
      });

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
