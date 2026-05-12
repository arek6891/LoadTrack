import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class InventoryService {
  static async startSession(userId: string) {
    // Sprawdź czy jest już otwarta sesja
    const openSession = await prisma.inventorySession.findFirst({
      where: { status: 'OPEN' }
    });

    if (openSession) {
      throw new Error('Istnieje już otwarta sesja inwentaryzacyjna.');
    }

    const session = await prisma.inventorySession.create({
      data: { createdBy: userId }
    });

    await AuditLogService.create('USER', userId, 'INVENTORY_STARTED', `Rozpoczęto nową sesję inwentaryzacyjną: ${session.id}`, userId);
    return session;
  }

  static async getActiveSession() {
    return prisma.inventorySession.findFirst({
      where: { status: 'OPEN' },
      include: {
        _count: { select: { counts: true } }
      }
    });
  }

  static async recordCount(sessionId: string, palletNumber: string, locationName: string, userId: string) {
    const session = await prisma.inventorySession.findUnique({ where: { id: sessionId } });
    if (!session || session.status === 'CLOSED') throw new Error('Nieaktywna sesja.');

    // Sprawdź czy paleta istnieje i gdzie powinna być wg systemu
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber },
      include: { location: true }
    });

    const isDiscrepancy = !pallet || pallet.location?.name !== locationName || pallet.status !== 'IN_STOCK';

    const count = await prisma.inventoryCount.create({
      data: {
        sessionId,
        palletNumber,
        locationName,
        isDiscrepancy
      }
    });

    return count;
  }

  static async closeSession(sessionId: string, userId: string) {
    const session = await prisma.inventorySession.findUnique({
      where: { id: sessionId },
      include: { counts: true }
    });

    if (!session) throw new Error('Sesja nie znaleziona.');

    const closedSession = await prisma.inventorySession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED', closedAt: new Date() }
    });

    // Raportowanie: znajdź palety, które powinny być w systemie (IN_STOCK), ale nie zostały zeskanowane
    const allInStockPallets = await prisma.pallet.findMany({
      where: { status: 'IN_STOCK' },
      select: { palletNumber: true, location: { select: { name: true } } }
    });

    const scannedPalletNumbers = session.counts.map(c => c.palletNumber);
    const missingPallets = allInStockPallets.filter(p => !scannedPalletNumbers.includes(p.palletNumber));

    await AuditLogService.create('USER', userId, 'INVENTORY_CLOSED', `Zamknięto sesję inwentaryzacyjną. Wykryto ${missingPallets.length} brakujących palet.`, userId);

    return {
      session: closedSession,
      summary: {
        totalScanned: session.counts.length,
        discrepancies: session.counts.filter(c => c.isDiscrepancy).length,
        missing: missingPallets
      }
    };
  }
}
