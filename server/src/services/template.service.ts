import prisma from '../utils/prisma';
import { AuditLogService } from './auditLog.service';
import { TemplateType } from '@prisma/client';

export class TemplateService {
  static async getAllTemplates() {
    return prisma.labelTemplate.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getDefaultTemplate(type: TemplateType) {
    const template = await prisma.labelTemplate.findFirst({
      where: { type, isDefault: true }
    });
    if (!template) {
      return prisma.labelTemplate.findFirst({
        where: { type },
        orderBy: { updatedAt: 'desc' }
      });
    }
    return template;
  }

  static async createTemplate(data: any, userId: string) {
    if (data.isDefault) {
      await prisma.labelTemplate.updateMany({
        where: { type: data.type, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.labelTemplate.create({
      data: { 
        name: data.name, 
        type: data.type, 
        htmlContent: data.htmlContent, 
        cssContent: data.cssContent || '', 
        isDefault: !!data.isDefault 
      }
    });

    await AuditLogService.create('TEMPLATE', template.id, 'CREATED', `Dodano szablon: ${template.name}`, userId);
    return template;
  }

  static async updateTemplate(id: string, data: any, userId: string) {
    if (data.isDefault) {
      const current = await prisma.labelTemplate.findUnique({ where: { id } });
      const targetType = data.type || current?.type;
      
      await prisma.labelTemplate.updateMany({
        where: { type: targetType, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.labelTemplate.update({
      where: { id },
      data
    });

    await AuditLogService.create('TEMPLATE', id, 'UPDATED', `Zaktualizowano szablon: ${template.name}`, userId);
    return template;
  }

  static async deleteTemplate(id: string, userId: string) {
    const template = await prisma.labelTemplate.findUnique({ where: { id } });
    if (template) {
      await AuditLogService.create('TEMPLATE', id, 'DELETED', `Usunięto szablon: ${template.name}`, userId);
    }
    return prisma.labelTemplate.delete({ where: { id } });
  }
}
