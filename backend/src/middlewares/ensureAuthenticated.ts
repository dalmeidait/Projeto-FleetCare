// backend/src/middlewares/ensureAuthenticated.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

// Aqui nós dizemos exatamente o que tem dentro do crachá
interface Payload {
  id: string;
  role: string;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  // 1. Pega o crachá da requisição
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ message: "Crachá (Token) não enviado." });
  }

  // O token vem no formato "Bearer 123456...". Vamos pegar só os números.
  const [, token] = authToken.split(" ");

  try {
    // 2. Tenta abrir o crachá usando a nossa senha secreta
    const decoded = verify(token, process.env.JWT_SECRET as string) as Payload;

    // 3. SEGREDO REVELADO: Anexa o ID e o Cargo de forma padronizada no request!
    (req as any).user = {
      id: decoded.id,
      role: decoded.role
    };

    // Pode passar!
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Crachá (Token) inválido ou expirado." });
  }
}