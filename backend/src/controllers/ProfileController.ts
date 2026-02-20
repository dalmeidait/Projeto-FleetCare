// backend/src/controllers/ProfileController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfileController {
  async handle(req: Request, res: Response) {
    const reqAny = req as any;
    // Pega o ID não importa de qual formato ele venha no Token
    const userId = reqAny.user?.id || reqAny.user || reqAny.user_id || reqAny.userId; 
    
    try {
      if (!userId) {
        return res.status(401).json({ message: "Crachá inválido." });
      }

      const user = await prisma.user.findUnique({
        where: { id: String(userId) },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          department: true 
        }
      });

      // 🛡️ O ESCUDO AQUI: Se o ID existir no Token, mas não existir mais no Banco de Dados!
      if (!user) {
        return res.status(401).json({ message: "Usuário deletado ou não encontrado. Faça login novamente." });
      }

      return res.json(user);
    } catch (error) {
      console.error("Erro no ProfileController:", error);
      return res.status(500).json({ message: "Erro interno ao carregar perfil." });
    }
  }
}