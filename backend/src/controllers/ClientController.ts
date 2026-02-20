// backend/src/controllers/ClientController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientController {
  
  // 1. CRIAR
  async create(req: Request, res: Response) {
    const { name, document, phone, email } = req.body;
    try {
      const documentExists = await prisma.client.findFirst({ where: { document } });
      if (documentExists) return res.status(400).json({ message: "Este documento já está cadastrado!" });

      if (email) {
        const emailExists = await prisma.client.findFirst({ where: { email } });
        if (emailExists) return res.status(400).json({ message: "Este e-mail já está em uso!" });
      }

      const client = await prisma.client.create({ data: { name, document, phone, email } });
      return res.status(201).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao cadastrar cliente." });
    }
  }

  // 2. LER / LISTAR
  async list(req: Request, res: Response) {
    try {
      const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar clientes." });
    }
  }

  // 3. ATUALIZAR (Editar)
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, document, phone, email } = req.body;
    try {
      const client = await prisma.client.update({
        where: { id },
        data: { name, document, phone, email }
      });
      return res.json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar cliente." });
    }
  }

  // 4. DELETAR
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.client.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      // Dica: Se o cliente tiver veículos, o banco pode bloquear a exclusão por segurança!
      return res.status(500).json({ message: "Erro ao deletar cliente. Verifique se ele possui veículos vinculados." });
    }
  }
}