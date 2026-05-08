import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatsService } from '../services/stats.service';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await StatsService.getDashboardStats();
  res.json(stats);
});
