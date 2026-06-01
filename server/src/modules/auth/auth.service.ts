import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { BCRYPT_ROUNDS } from '../../config/constants';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterBody, LoginBody } from './auth.schema';

function signToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

function sanitize(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function register(body: RegisterBody) {
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AppError('Email already in use', 409, 'CONFLICT');
  }

  const password = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name, password },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitize(user), token };
}

export async function login(body: LoginBody) {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(body.password, user.password);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitize(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return sanitize(user);
}
