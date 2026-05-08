import { z } from 'zod';

export const createLoadingSchema = z.object({
  driverName: z.string().min(1),
  vehicleRegistration: z.string().min(1),
  expectedPallets: z.array(z.string()).optional(),
});

export const updateLoadingSchema = z.object({
  driverName: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  expectedPallets: z.array(z.string()).optional(),
});

export const addPalletToLoadingSchema = z.object({
  loadingId: z.string().uuid(),
  palletNumber: z.string().min(1),
});

export const closeLoadingSchema = z.object({
  force: z.boolean().optional(),
});
