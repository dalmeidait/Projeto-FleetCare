// backend/src/routes.ts
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { VehicleController } from './controllers/VehicleController';
import { ClientController } from './controllers/ClientController'; // <-- Importando o Cliente!
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { can } from './middlewares/can';

const router = Router();

const authController = new AuthController();
const vehicleController = new VehicleController();
const clientController = new ClientController(); // <-- Ligando o Cliente!

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.handle);

// --- ROTAS PROTEGIDAS (Exigem Login) ---
router.get('/me', ensureAuthenticated, (req, res) => {
  res.json({ message: "Seu perfil", user: req.user });
});

// --- ROTAS DE CLIENTES (Módulo Novo!) ---
router.get('/clients', ensureAuthenticated, clientController.list);
router.post('/clients', ensureAuthenticated, can(['ADMIN']), clientController.create);
router.put('/clients/:id', ensureAuthenticated, can(['ADMIN']), clientController.update); // NOVA!
router.delete('/clients/:id', ensureAuthenticated, can(['ADMIN']), clientController.delete); // NOVA!

// --- ROTAS DE VEÍCULOS (CRUD Completo!) ---
router.get('/vehicles', ensureAuthenticated, vehicleController.list);
router.post('/vehicles', ensureAuthenticated, can(['ADMIN']), vehicleController.create);
router.put('/vehicles/:id', ensureAuthenticated, can(['ADMIN']), vehicleController.update);
router.delete('/vehicles/:id', ensureAuthenticated, can(['ADMIN']), vehicleController.delete);

export { router };