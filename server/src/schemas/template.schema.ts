import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['PACKAGE', 'PALLET']),
  htmlContent: z.string().min(1),
  cssContent: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();
