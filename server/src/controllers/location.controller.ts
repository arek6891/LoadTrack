import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { LocationService } from '../services/location.service';
import { AuthRequest } from '../middleware/auth';
import { createLocationSchema } from '../schemas/location.schema';

export const getLocations = asyncHandler(async (req: Request, res: Response) => {
  const locations = await LocationService.getAllLocations();
  res.json(locations);
});

export const createLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = createLocationSchema.parse(req.body);
  const newLocation = await LocationService.createLocation(name, req.user!.id);
  res.status(201).json(newLocation);
});
