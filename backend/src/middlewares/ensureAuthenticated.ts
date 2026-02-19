// backend/src/middlewares/ensureAuthenticated.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface Payload {
  sub: string;
  role: string;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ message: "Token faltando" });
  }

  // O token vem como "Bearer 12345...", vamos pegar só o código
  const [, token] = authToken.split(" ");

  try {
    const { sub, role } = verify(token, process.env.JWT_SECRET as string) as Payload;

    // Colocamos os dados do usuário dentro da requisição para usar depois
    req.user = {
      id: sub,
      role: role
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}