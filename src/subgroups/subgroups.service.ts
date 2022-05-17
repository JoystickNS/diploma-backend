import { Injectable } from "@nestjs/common";
import { IGroup } from "../interfaces/IGroup";

@Injectable()
export class SubgroupsService {
  getGroupsWithoutDuplicates(allSubgroups: any): IGroup[] {
    const groupsWithoutDuplicates = [];
    allSubgroups.forEach((subgroup: any) => {
      if (
        !groupsWithoutDuplicates.find(
          (i) => i.id === subgroup.subgroup.group.id
        )
      ) {
        groupsWithoutDuplicates.push(subgroup.subgroup.group);
      }
    });

    return groupsWithoutDuplicates;
  }
}
