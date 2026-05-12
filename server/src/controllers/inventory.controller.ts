import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { InventoryService } from '../services/inventory.service';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export const startSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await InventoryService.startSession(req.user!.id);
  res.status(201).json(session);
});

export const getActiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await InventoryService.getActiveSession();
  res.json(session);
});

const recordCountSchema = z.object({
  sessionId: z.string().uuid(),
  palletNumber: z.string().min(1),
  locationName: z.string().min(1)
});

export const recordCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId, palletNumber, locationName } = recordCountSchema.parse(req.body);
  const count = await InventoryService.recordCount(sessionId, palletNumber, locationName, req.user!.id);
  res.json(count);
});

export const closeSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await InventoryService.closeSession(req.params.id, req.user!.id);
  res.json(result);
});
