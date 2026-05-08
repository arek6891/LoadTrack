import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../utils/prisma';

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { entity, entityId, limit = 50, page = 1 } = req.query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const where: any = {};
  if (entity) where.entity = entity;
  if (entityId) where.entityId = entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    }),
    prisma.auditLog.count({ where })
  ]);

  res.json({
    data: logs,
    pagination: {
      total,
      pages: Math.ceil(total / take),
      currentPage: Number(page)
    }
  });
});
