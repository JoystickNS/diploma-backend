import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DisciplinesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.discipline.findMany();
  }
}
