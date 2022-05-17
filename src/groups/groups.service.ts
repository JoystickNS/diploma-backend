import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.group.findMany();
  }
}
