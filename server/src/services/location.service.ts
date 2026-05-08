import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class LocationService {
  static async getAllLocations() {
    return prisma.location.findMany({
      include: {
        _count: {
          select: { packages: true, pallets: true }
        }
      }
    });
  }

  static async createLocation(name: string, userId: string) {
    const newLocation = await prisma.location.create({
      data: { name },
    });
    await AuditLogService.create('LOCATION', newLocation.id, 'CREATED', `Dodano lokalizację: ${name}`, userId);
    return newLocation;
  }
}
