import { PrismaClient } from "@prisma/client";
import { RouteRepositoryPort } from "../../../core/ports/RouteRepositoryPort";

export class RouteRepository implements RouteRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.route.findMany();
  }

  async findBaseline() {
    return this.prisma.route.findFirst({ where: { is_baseline: true } });
  }

  async setBaseline(id: string) {
    await this.prisma.route.updateMany({ data: { is_baseline: false } }); // unset all
    await this.prisma.route.update({ where: { id }, data: { is_baseline: true } });
  }
}