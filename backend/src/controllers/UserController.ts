// backend/src/controllers/UserController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export class UserController {
  
  // 1. LISTAR TODOS OS USUÁRIOS
  async list(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          department: true, 
          isActive: true, // Traz o status (Ligado/Desligado)
          createdAt: true 
        },
        orderBy: { name: 'asc' }
      });
      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao buscar usuários." });
    }
  }

  // 2. CRIAR NOVO USUÁRIO
  async create(req: Request, res: Response) {
    const { name, email, password, role, department } = req.body;

    try {
      // Verifica se o e-mail já existe para não dar erro no banco
      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: "Este e-mail já está em uso." });
      }

      // Criptografa a senha antes de salvar
      const passwordHash = await hash(password, 8);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role,
          department,
          isActive: true // Todo usuário novo nasce ativo
        },
        select: { id: true, name: true, email: true, role: true } // Não devolve a senha na resposta
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao criar usuário." });
    }
  }

  // 3. EDITAR USUÁRIO (Inclui Inativar/Ativar - Soft Delete)
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, role, department, isActive } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { 
          name, 
          email, 
          role, 
          department, 
          isActive // O SYS_ADMIN manda false aqui para "demitir/inativar" a pessoa
        },
        select: { id: true, name: true, isActive: true }
      });

      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao atualizar usuário." });
    }
  }

  // 4. ALTERAR SENHA (Exclusivo do SYS_ADMIN para ajudar quem esqueceu)
  async changePassword(req: Request, res: Response) {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "A nova senha deve ter no mínimo 6 caracteres." });
    }

    try {
      const passwordHash = await hash(newPassword, 8);

      await prisma.user.update({
        where: { id },
        data: { password: passwordHash }
      });

      return res.json({ message: "Senha alterada com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao alterar a senha." });
    }
  }
}