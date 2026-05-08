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
}
