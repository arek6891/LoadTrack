import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ReportService } from '../services/report.service';

export const getInventoryReport = asyncHandler(async (req: Request, res: Response) => {
  const reportData = await ReportService.getInventoryReport();
  res.json(reportData);
});
