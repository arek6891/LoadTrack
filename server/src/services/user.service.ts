import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuditLogService } from './auditLog.service';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true }
    });
  }

  static async createUser(data: any, adminId: string) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.role || 'OPERATOR'
      }
    });

    await AuditLogService.create('USER', user.id, 'CREATED', `Utworzono użytkownika: ${user.username} (${user.role})`, adminId);
    return user;
  }

  static async updateUser(id: string, data: any, adminId: string) {
    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, role: true }
    });

    await AuditLogService.create('USER', id, 'UPDATED', `Zaktualizowano dane użytkownika: ${updatedUser.username}`, adminId);
    return updatedUser;
  }

  static async deleteUser(id: string, adminId: string) {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete) {
      await AuditLogService.create('USER', id, 'DELETED', `Usunięto użytkownika: ${userToDelete.username}`, adminId);
    }
    return prisma.user.delete({ where: { id } });
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({ where: { username: data.username } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    return { token, user: { username: user.username, role: user.role } };
  }
}
