import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PackageService } from '../services/package.service';
import { AuthRequest } from '../middleware/auth';
import { createPackageSchema } from '../schemas/package.schema';

export const createPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trackingNumber } = createPackageSchema.parse(req.body);
  const newPackage = await PackageService.createPackage(trackingNumber, req.user!.id);
  res.status(201).json(newPackage);
});

export const deletePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await PackageService.deletePackage(id, req.user!.id);
  res.json({ message: 'Package deleted successfully' });
});
