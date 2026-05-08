import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TemplateService } from '../services/template.service';
import { AuthRequest } from '../middleware/auth';
import { createTemplateSchema, updateTemplateSchema } from '../schemas/template.schema';
import { TemplateType } from '@prisma/client';

export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await TemplateService.getAllTemplates();
  res.json(templates);
});

export const getDefaultTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const template = await TemplateService.getDefaultTemplate(type as TemplateType);
  res.json(template);
});

export const createTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = createTemplateSchema.parse(req.body);
  const template = await TemplateService.createTemplate(validatedData, req.user!.id);
  res.status(201).json(template);
});

export const updateTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateTemplateSchema.parse(req.body);
  const template = await TemplateService.updateTemplate(req.params.id, validatedData, req.user!.id);
  res.json(template);
});

export const deleteTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  await TemplateService.deleteTemplate(req.params.id, req.user!.id);
  res.json({ message: 'Template deleted successfully' });
});
