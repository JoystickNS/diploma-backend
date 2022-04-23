import { ActionEnum, SubjectEnum } from "@prisma/client";

export interface IRequiredRule {
  action: ActionEnum;
  subject: SubjectEnum;
}
