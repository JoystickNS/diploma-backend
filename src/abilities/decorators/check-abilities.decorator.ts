import { SetMetadata } from "@nestjs/common";
import { IRequiredRule } from "../interfaces/required-rule.interface";

export const CHECK_ABILITIES = "CHECK_ABILITIES";
export const CheckAbilities = (...requirements: IRequiredRule[]) =>
  SetMetadata(CHECK_ABILITIES, requirements);
