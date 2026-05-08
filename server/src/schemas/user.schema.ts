import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'LEADER', 'OPERATOR']).optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'LEADER', 'OPERATOR']).optional(),
  password: z.string().min(6).optional(),
});
