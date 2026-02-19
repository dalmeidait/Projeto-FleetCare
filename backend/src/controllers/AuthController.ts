import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    // 1. Verifica se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Email ou senha incorretos" });
    }

    // 2. Verifica a senha
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Email ou senha incorretos" });
    }

    // 3. Gera o Token
    const token = sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  }
}