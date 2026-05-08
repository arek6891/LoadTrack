import * as XLSX from 'xlsx';
import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';

export class ImportService {
  static async importData(buffer: Buffer, type: 'PACKAGE' | 'PALLET', userId: string) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let importedCount = 0;
    let skippedCount = 0;

    if (type === 'PACKAGE') {
      for (const row of data) {
        const trackingNumber = String(row.trackingNumber || row.number || row.tracking || '').trim();
        if (!trackingNumber) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.package.create({
            data: { trackingNumber, status: 'IN_STOCK' }
          });
          importedCount++;
        } catch (err) {
          skippedCount++;
        }
      }
      await AuditLogService.create('PACKAGE', 'MASS_IMPORT', 'IMPORTED', `Import masowy paczek: +${importedCount}, pominięto: ${skippedCount}`, userId);
    } else if (type === 'PALLET') {
      for (const row of data) {
        const palletNumber = String(row.palletNumber || row.number || row.pallet || '').trim();
        if (!palletNumber) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.pallet.create({
            data: { palletNumber, status: 'IN_STOCK' }
          });
          importedCount++;
        } catch (err) {
          skippedCount++;
        }
      }
      await AuditLogService.create('PALLET', 'MASS_IMPORT', 'IMPORTED', `Import masowy palet: +${importedCount}, pominięto: ${skippedCount}`, userId);
    } else {
      throw new Error('Invalid import type');
    }

    return { importedCount, skippedCount };
  }
}
