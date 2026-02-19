// backend/src/routes.ts
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { can } from './middlewares/can';

const router = Router();
const authController = new AuthController();

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.handle);

// --- ROTAS PROTEGIDAS (Exemplos para AC1) ---

// 1. Rota que qualquer um logado acessa (Perfil)
router.get('/me', ensureAuthenticated, (req, res) => {
  res.json({ message: "Seu perfil", user: req.user });
});

// 2. Rota que SÓ ADMIN acessa (Relatórios Financeiros, por exemplo)
router.get('/admin/stats', ensureAuthenticated, can(['ADMIN']), (req, res) => {
  res.json({ message: "Bem-vindo, Administrador! Aqui estão os dados sensíveis." });
});

// 3. Rota que MECÂNICO e ADMIN acessam (Ordens de Serviço)
router.get('/os/list', ensureAuthenticated, can(['ADMIN', 'MECHANIC']), (req, res) => {
  res.json({ message: "Lista de serviços para equipe técnica." });
});

export { router };