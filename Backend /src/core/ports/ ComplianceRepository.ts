import { prisma } from "../../infrastructure/db/prisma";
import { ComplianceEntity } from "../domain/ComplianceEntity";


export class ComplianceRepository {
  async saveCB(entity: ComplianceEntity) {
    return await prisma.shipCompliance.create({
      data: entity.toPrisma()
    });
  }
}