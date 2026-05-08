import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class PalletService {
  static async getPalletByNumber(palletNumber: string) {
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber },
      include: { packages: true, location: true }
    });
    if (!pallet) throw new Error('Pallet not found');
    return pallet;
  }

  static async createPallet(palletNumber: string, userId: string) {
    const newPallet = await prisma.pallet.create({
      data: { palletNumber },
    });
    await AuditLogService.create('PALLET', newPallet.id, 'CREATED', `Utworzono paletę: ${palletNumber}`, userId);
    return newPallet;
  }

  static async addPackageToPallet(palletId: string, trackingNumber: string, userId: string) {
    const pkg = await prisma.package.findUnique({
      where: { trackingNumber },
      include: { pallet: true }
    });

    if (!pkg) throw new Error('Package not found');
    if (pkg.palletId) throw new Error('Package already on another pallet');

    const pallet = await prisma.pallet.findUnique({ where: { id: palletId } });
    if (!pallet) throw new Error('Pallet not found');

    const updatedPackage = await prisma.package.update({
      where: { id: pkg.id },
      data: { palletId }
    });

    await AuditLogService.create('PACKAGE', pkg.id, 'ADDED_TO_PALLET', `Dodano paczkę ${trackingNumber} do palety ${pallet.palletNumber}`, userId);
    return updatedPackage;
  }

  static async movePallet(palletNumber: string, locationName: string, userId: string) {
    const pallet = await prisma.pallet.findUnique({ where: { palletNumber } });
    const location = await prisma.location.findUnique({ where: { name: locationName } });

    if (!pallet) throw new Error('Pallet not found');
    if (!location) throw new Error('Location not found');

    const updatedPallet = await prisma.pallet.update({
      where: { id: pallet.id },
      data: { locationId: location.id },
      include: { packages: true, location: true }
    });

    await prisma.package.updateMany({
      where: { palletId: pallet.id },
      data: { locationId: location.id }
    });

    await AuditLogService.create('PALLET', pallet.id, 'MOVED', `Przeniesiono paletę ${palletNumber} do lokalizacji ${locationName}`, userId);
    return updatedPallet;
  }

  static async deletePallet(id: string, userId: string) {
    const pallet = await prisma.pallet.findUnique({ where: { id } });
    if (pallet) {
      await AuditLogService.create('PALLET', id, 'DELETED', `Usunięto paletę: ${pallet.palletNumber}`, userId);
    }
    await prisma.package.updateMany({
      where: { palletId: id },
      data: { palletId: null }
    });
    return prisma.pallet.delete({ where: { id } });
  }
}
