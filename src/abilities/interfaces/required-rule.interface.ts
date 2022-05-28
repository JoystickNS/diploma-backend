import { ActionEnum, AccessObjectEnum } from "@prisma/client";

export interface IRequiredRule {
  action: ActionEnum;
  object: AccessObjectEnum;
}
