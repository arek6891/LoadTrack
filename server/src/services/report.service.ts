import prisma from '../utils/prisma';

export class ReportService {
  static async getInventoryReport() {
    const [packages, pallets] = await Promise.all([
      prisma.package.findMany({
        select: {
          trackingNumber: true,
          status: true,
          createdAt: true,
          pallet: { select: { palletNumber: true } },
          location: { select: { name: true } }
        }
      }),
      prisma.pallet.findMany({
        where: { packages: { none: {} } },
        select: {
          palletNumber: true,
          status: true,
          createdAt: true,
          location: { select: { name: true } }
        }
      })
    ]);

    return [
      ...packages.map(p => ({
        type: 'PACZKA',
        number: p.trackingNumber,
        status: p.status,
        parentPallet: p.pallet?.palletNumber || '-',
        location: p.location?.name || '-',
        createdAt: p.createdAt
      })),
      ...pallets.map(p => ({
        type: 'PALETA',
        number: p.palletNumber,
        status: p.status,
        parentPallet: 'N/A',
        location: p.location?.name || '-',
        createdAt: p.createdAt
      }))
    ];
  }

  static async getDetailedReport() {
    const [packages, pallets] = await Promise.all([
      prisma.package.findMany({
        include: {
          pallet: {
            include: {
              loading: true
            }
          },
          location: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pallet.findMany({
        where: { packages: { none: {} } },
        include: {
          loading: true,
          location: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Fetch creators from AuditLog
    const packageIds = packages.map(p => p.id);
    const palletIds = pallets.map(p => p.id);
    const orphanPalletIds = Array.from(new Set(packages.map(p => p.palletId).filter(Boolean))) as string[];
    const allPalletIds = Array.from(new Set([...palletIds, ...orphanPalletIds]));

    const [packageLogs, palletLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          entity: 'PACKAGE',
          entityId: { in: packageIds },
          action: 'CREATED'
        },
        include: { user: { select: { username: true } } }
      }),
      prisma.auditLog.findMany({
        where: {
          entity: 'PALLET',
          entityId: { in: allPalletIds },
          action: 'CREATED'
        },
        include: { user: { select: { username: true } } }
      })
    ]);

    const packageUserMap = new Map(packageLogs.map(log => [log.entityId, log.user?.username || 'System']));
    const palletUserMap = new Map(palletLogs.map(log => [log.entityId, log.user?.username || 'System']));

    const packageData = packages.map(p => ({
      type: 'PACZKA',
      trackingNumber: p.trackingNumber,
      palletNumber: p.pallet?.palletNumber || '-',
      location: p.location?.name || '-',
      status: p.status,
      loading: p.pallet?.loading ? `${p.pallet.loading.driverName} (${p.pallet.loading.vehicleRegistration})` : '-',
      createdAt: p.createdAt,
      createdBy: packageUserMap.get(p.id) || '-',
      updatedAt: p.updatedAt
    }));

    const palletData = pallets.map(p => ({
      type: 'PALETA',
      trackingNumber: '-',
      palletNumber: p.palletNumber,
      location: p.location?.name || '-',
      status: p.status,
      loading: p.loading ? `${p.loading.driverName} (${p.loading.vehicleRegistration})` : '-',
      createdAt: p.createdAt,
      createdBy: palletUserMap.get(p.id) || '-',
      updatedAt: p.updatedAt
    }));

    return [...packageData, ...palletData];
  }
}
