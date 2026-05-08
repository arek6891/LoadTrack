import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { LoadingService } from '../services/loading.service';
import { AuthRequest } from '../middleware/auth';
import { createLoadingSchema, updateLoadingSchema, addPalletToLoadingSchema, closeLoadingSchema } from '../schemas/loading.schema';

export const getLoadings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const loadings = await LoadingService.getOpenLoadings();
  res.json(loadings);
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const history = await LoadingService.getLoadingHistory(req.query);
  res.json(history);
});

export const createLoading = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = createLoadingSchema.parse(req.body);
  const newLoading = await LoadingService.createLoading(validatedData, req.user!.id);
  res.status(201).json(newLoading);
});

export const updateLoading = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateLoadingSchema.parse(req.body);
  const updated = await LoadingService.updateLoading(req.params.id, validatedData, req.user!.id);
  res.json(updated);
});

export const addPallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loadingId, palletNumber } = addPalletToLoadingSchema.parse(req.body);
  const result = await LoadingService.addPalletToLoading(loadingId, palletNumber, req.user!.id);
  res.json(result);
});

export const closeLoading = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { force } = closeLoadingSchema.parse(req.body);
  try {
    const result = await LoadingService.closeLoading(req.params.id, !!force, req.user!.id);
    res.json(result);
  } catch (error: any) {
    if (error.code === 'INCOMPLETE_LOADING') {
      res.status(400).json({ 
        error: error.code, 
        missingPallets: error.missingPallets,
        message: error.message
      });
      return;
    }
    throw error;
  }
});
