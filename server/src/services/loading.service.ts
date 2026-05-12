import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class LoadingService {
  static async getOpenLoadings() {
    return prisma.loading.findMany({
      where: { status: 'OPEN' },
      include: { _count: { select: { pallets: true } } }
    });
  }

  static async getLoadingHistory(filters: any) {
    const { startDate, endDate, driverName } = filters;
    const where: any = { status: 'CLOSED' };

    if (startDate || endDate) {
      where.closedAt = {};
      if (startDate) where.closedAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.closedAt.lte = end;
      }
    }

    if (driverName) {
      where.driverName = { contains: driverName, mode: 'insensitive' };
    }

    return prisma.loading.findMany({
      where,
      include: { 
        _count: { select: { pallets: true } },
        pallets: {
          include: { _count: { select: { packages: true } } }
        }
      },
      orderBy: { closedAt: 'desc' }
    });
  }

  static async createLoading(data: any, userId: string) {
    if (data.expectedPallets && data.expectedPallets.length > 0) {
      const existingPallets = await prisma.pallet.findMany({
        where: {
          palletNumber: { in: data.expectedPallets },
          status: 'IN_STOCK'
        }
      });

      if (existingPallets.length !== data.expectedPallets.length) {
        const foundNumbers = existingPallets.map(p => p.palletNumber);
        const missingNumbers = data.expectedPallets.filter((p: string) => !foundNumbers.includes(p));
        throw new Error(`Niektóre palety są nieprawidłowe lub niedostępne: ${missingNumbers.join(', ')}`);
      }
    }

    const newLoading = await prisma.loading.create({
      data: { 
        driverName: data.driverName, 
        vehicleRegistration: data.vehicleRegistration,
        expectedPallets: data.expectedPallets || []
      }
    });
    await AuditLogService.create('LOADING', newLoading.id, 'CREATED', `Utworzono załadunek: ${data.driverName} (${data.vehicleRegistration})`, userId);
    return newLoading;
  }

  static async updateLoading(id: string, data: any, userId: string) {
    const updated = await prisma.loading.update({
      where: { id },
      data
    });
    await AuditLogService.create('LOADING', id, 'UPDATED', `Zaktualizowano dane załadunku`, userId);
    return updated;
  }

  static async addPalletToLoading(loadingId: string, palletNumber: string, userId: string) {
    const pallet = await prisma.pallet.findUnique({ where: { palletNumber } });
    if (!pallet) throw new Error('Pallet not found');
    if (pallet.status === 'LOADED') throw new Error('Pallet already loaded');

    const loading = await prisma.loading.findUnique({ where: { id: loadingId } });
    if (!loading) throw new Error('Loading not found');

    const isExpected = loading.expectedPallets.length === 0 || loading.expectedPallets.includes(palletNumber);

    const updatedPallet = await prisma.pallet.update({
      where: { id: pallet.id },
      data: { loadingId, status: 'LOADED', locationId: null }
    });

    await prisma.package.updateMany({
      where: { palletId: pallet.id },
      data: { status: 'LOADED', locationId: null }
    });

    await AuditLogService.create('PALLET', pallet.id, 'LOADED', `Załadowano paletę ${palletNumber} na transport ${loading.driverName}`, userId);
    return { ...updatedPallet, isExpected };
  }

  static async closeLoading(id: string, force: boolean, userId: string) {
    const loading = await prisma.loading.findUnique({
      where: { id },
      include: { pallets: true }
    });

    if (!loading) throw new Error('Loading not found');

    if (loading.expectedPallets.length > 0 && !force) {
      const loadedPalletNumbers = loading.pallets.map(p => p.palletNumber);
      const missingPallets = loading.expectedPallets.filter(p => !loadedPalletNumbers.includes(p));
      
      if (missingPallets.length > 0) {
        const error: any = new Error(`Brakuje ${missingPallets.length} palet z planowanej listy.`);
        error.code = 'INCOMPLETE_LOADING';
        error.missingPallets = missingPallets;
        throw error;
      }
    }

    // Walidacja danych przed zamknięciem
    if (!loading.driverName || !loading.vehicleRegistration) {
      throw new Error('Nie można zamknąć załadunku bez danych kierowcy i pojazdu.');
    }

    const updatedLoading = await prisma.loading.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() }
    });

    await AuditLogService.create('LOADING', id, 'CLOSED', `Zamknięto załadunek: ${updatedLoading.driverName}`, userId);
    return updatedLoading;
  }
}
