import prisma from '../utils/prisma';

export class StatsService {
  static async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      packageStats,
      palletStats,
      locationCount,
      todayLoadings
    ] = await Promise.all([
      prisma.package.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.pallet.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.location.count(),
      prisma.loading.findMany({
        where: {
          status: 'CLOSED',
          closedAt: { gte: today }
        },
        include: {
          _count: { select: { pallets: true } }
        }
      })
    ]);

    const occupiedLocations = await prisma.location.count({
      where: {
        OR: [
          { packages: { some: {} } },
          { pallets: { some: {} } }
        ]
      }
    });

    return {
      packages: packageStats,
      pallets: palletStats,
      locations: {
        total: locationCount,
        occupied: occupiedLocations
      },
      today: {
        closedLoadings: todayLoadings.length,
        loadedPallets: todayLoadings.reduce((acc, curr) => acc + curr._count.pallets, 0)
      }
    };
  }
}
