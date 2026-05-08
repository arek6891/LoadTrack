import prisma from '../utils/prisma';
import { EntityType } from '@prisma/client';

export class AuditLogService {
  static async create(
    entity: EntityType,
    entityId: string,
    action: string,
    details?: string,
    userId?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          entity,
          entityId,
          action,
          details,
          userId
        }
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }
}
