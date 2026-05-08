import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SearchService } from '../services/search.service';

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  try {
    const result = await SearchService.globalSearch(String(q));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
