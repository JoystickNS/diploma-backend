import { AccessSubjectEnum, ActionEnum } from "@prisma/client";

export interface IRequiredRule {
  action: ActionEnum;
  subject: AccessSubjectEnum;
}
