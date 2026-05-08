import prisma from '../utils/prisma';

export class SearchService {
  static async globalSearch(query: string) {
    // Szukamy paczki
    const pkg = await prisma.package.findUnique({
      where: { trackingNumber: query },
      include: { pallet: true, location: true }
    });

    if (pkg) {
      return { type: 'package', data: pkg };
    }

    // Jeśli nie paczka, szukamy palety
    const pallet = await prisma.pallet.findUnique({
      where: { palletNumber: query },
      include: { packages: true, location: true, loading: true }
    });

    if (pallet) {
      return { type: 'pallet', data: pallet };
    }

    throw new Error('Nie znaleziono paczki ani palety o tym numerze');
  }
}
