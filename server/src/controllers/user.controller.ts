import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';
import { loginSchema, registerSchema, updateUserSchema } from '../schemas/user.schema';

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await UserService.getAllUsers();
  res.json(users);
});

export const registerUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const user = await UserService.createUser(validatedData, req.user!.id);
  res.status(201).json({ id: user.id, username: user.username, role: user.role });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateUserSchema.parse(req.body);
  const updatedUser = await UserService.updateUser(req.params.id, validatedData, req.user!.id);
  res.json(updatedUser);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id === id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }
  await UserService.deleteUser(id, req.user!.id);
  res.json({ message: 'User deleted successfully' });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await UserService.login(validatedData);
  res.json(result);
});
