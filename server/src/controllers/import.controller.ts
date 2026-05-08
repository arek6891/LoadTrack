import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ImportService } from '../services/import.service';
import { AuthRequest } from '../middleware/auth';

export const massImport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const { type } = req.body;
  
  const result = await ImportService.importData(req.file.buffer, type, req.user!.id);
  res.json(result);
});
