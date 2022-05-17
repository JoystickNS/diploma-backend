import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WorkTypesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.workType.findMany();
  }
}
