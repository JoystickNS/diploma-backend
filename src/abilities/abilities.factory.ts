import { AbilityBuilder, AbilityClass, subject } from "@casl/ability";
import { PrismaAbility, Subjects } from "@casl/prisma";
import { Injectable } from "@nestjs/common";
import {
  AccessObject,
  AccessObjectEnum,
  Action,
  ActionEnum,
  Attestation,
  Control,
  Discipline,
  Grade,
  Group,
  Journal,
  JournalsOnGrades,
  Lesson,
  LessonsOnSubgroups,
  LessonTopic,
  LessonType,
  Permission,
  Points,
  Role,
  RolesOnPermissions,
  Student,
  StudentsOnAttestations,
  StudentsOnGroups,
  StudentsOnSubgroups,
  StudentStatus,
  StudentStatusesOnStudents,
  Subgroup,
  SubgroupNumber,
  SubgroupsOnJournals,
  Token,
  User,
  UsersOnRoles,
  Visit,
  WorkType,
} from "@prisma/client";
import { JwtPayload } from "../classes/jwt-payload";
import { PermissionsService } from "../permissions/permissions.service";
import { RolesService } from "../roles/roles.service";

type AppAbility = PrismaAbility<
  [
    ActionEnum,
    Subjects<{
      AccessObject: AccessObject;
      Action: Action;
      Attestation: Attestation;
      Control: Control;
      Discipline: Discipline;
      Grade: Grade;
      Group: Group;
      Journal: Journal;
      JournalsOnGrades: JournalsOnGrades;
      Lesson: Lesson;
      LessonTopic: LessonTopic;
      LessonType: LessonType;
      LessonsOnSubgroups: LessonsOnSubgroups;
      Permission: Permission;
      Points: Points;
      Role: Role;
      RolesOnPermissions: RolesOnPermissions;
      Student: Student;
      StudentStatus: StudentStatus;
      StudentStatusesOnStudents: StudentStatusesOnStudents;
      StudentsOnAttestations: StudentsOnAttestations;
      StudentsOnGroups: StudentsOnGroups;
      StudentsOnSubgroups: StudentsOnSubgroups;
      Subgroup: Subgroup;
      SubgroupNumber: SubgroupNumber;
      SubgroupsOnJournals: SubgroupsOnJournals;
      Token: Token;
      User: User;
      UsersOnRoles: UsersOnRoles;
      Visit: Visit;
      WorkType: WorkType;
    }>
  ]
>;

@Injectable()
export class AbilitiesFactory {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService
  ) {}

  async defineAbilities(user: JwtPayload) {
    const AppAbility = PrismaAbility as AbilityClass<AppAbility>;
    const builder = new AbilityBuilder(AppAbility);
    const permissions = await this.permissionsService.getByUserId(user.id);

    if (permissions) {
      permissions.forEach((permission) => {
        builder.can(permission.action, AccessObjectEnum.Journal, {
          ...permission.conditions,
        });
      });
    }

    return builder.build();
  }
}
