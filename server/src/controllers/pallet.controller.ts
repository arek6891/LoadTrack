import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PalletService } from '../services/pallet.service';
import { AuthRequest } from '../middleware/auth';
import { createPalletSchema, addPackageToPalletSchema, movePalletSchema } from '../schemas/pallet.schema';

export const getPallet = asyncHandler(async (req: Request, res: Response) => {
  const pallet = await PalletService.getPalletByNumber(req.params.palletNumber);
  res.json(pallet);
});

export const getAvailablePallets = asyncHandler(async (req: Request, res: Response) => {
  const pallets = await PalletService.getAvailablePallets();
  res.json(pallets);
});

export const createPallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { palletNumber } = createPalletSchema.parse(req.body);
  const newPallet = await PalletService.createPallet(palletNumber, req.user!.id);
  res.status(201).json(newPallet);
});

export const addPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { palletId, trackingNumber } = addPackageToPalletSchema.parse(req.body);
  const updatedPackage = await PalletService.addPackageToPallet(palletId, trackingNumber, req.user!.id);
  res.json(updatedPackage);
});

export const movePallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { palletNumber, locationName } = movePalletSchema.parse(req.body);
  const updatedPallet = await PalletService.movePallet(palletNumber, locationName, req.user!.id);
  res.json(updatedPallet);
});

export const deletePallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  await PalletService.deletePallet(req.params.id, req.user!.id);
  res.json({ message: 'Pallet deleted successfully' });
});
