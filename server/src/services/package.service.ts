import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class PackageService {
  static async createPackage(trackingNumber: string, userId: string) {
    const newPackage = await prisma.package.create({
      data: {
        trackingNumber,
        status: 'IN_STOCK',
      },
    });

    await AuditLogService.create('PACKAGE', newPackage.id, 'CREATED', `Zeskanowano paczkę: ${trackingNumber}`, userId);
    return newPackage;
  }

  static async deletePackage(id: string, userId: string) {
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (pkg) {
      await AuditLogService.create('PACKAGE', id, 'DELETED', `Usunięto paczkę: ${pkg.trackingNumber}`, userId);
    }
    return prisma.package.delete({ where: { id } });
  }
}
