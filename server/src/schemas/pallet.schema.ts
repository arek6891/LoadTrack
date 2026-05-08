import { z } from 'zod';

export const createPalletSchema = z.object({
  palletNumber: z.string().min(3),
});

export const addPackageToPalletSchema = z.object({
  palletId: z.string().uuid(),
  trackingNumber: z.string().min(3),
});

export const movePalletSchema = z.object({
  palletNumber: z.string().min(3),
  locationName: z.string().min(1),
});
