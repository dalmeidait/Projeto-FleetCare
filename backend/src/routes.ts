// backend/src/routes.ts
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { VehicleController } from './controllers/VehicleController'; // Importando o controlador
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { can } from './middlewares/can';

const router = Router();

const authController = new AuthController();
const vehicleController = new VehicleController(); // Instanciando o controlador

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.handle);

// --- ROTAS PROTEGIDAS ---
router.get('/me', ensureAuthenticated, (req, res) => {
  res.json({ message: "Seu perfil", user: req.user });
});

// Rotas de Veículos que o servidor "esqueceu"
router.get('/vehicles', ensureAuthenticated, vehicleController.list);
router.post('/vehicles', ensureAuthenticated, can(['ADMIN']), vehicleController.create);

// Rotas de Veículos
router.get('/vehicles', ensureAuthenticated, vehicleController.list);
router.post('/vehicles', ensureAuthenticated, can(['ADMIN']), vehicleController.create);

// NOVA ROTA: Rota para apagar o carro (Passando o ID na URL)
router.delete('/vehicles/:id', ensureAuthenticated, can(['ADMIN']), vehicleController.delete);

export { router };