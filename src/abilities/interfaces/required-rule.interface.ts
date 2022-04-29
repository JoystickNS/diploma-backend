import { ActionEnum, ObjectEnum } from "@prisma/client";

export interface IRequiredRule {
  action: ActionEnum;
  object: ObjectEnum;
}
