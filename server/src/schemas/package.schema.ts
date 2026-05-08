import { z } from 'zod';

export const createPackageSchema = z.object({
  trackingNumber: z.string().min(3),
});
