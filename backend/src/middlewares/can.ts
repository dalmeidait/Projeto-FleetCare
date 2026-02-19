// backend/src/middlewares/can.ts
import { Request, Response, NextFunction } from 'express';

export function can(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Acesso negado: você não tem permissão para esta função." 
      });
    }

    return next();
  };
}