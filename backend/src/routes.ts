// backend/src/routes.ts
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { VehicleController } from './controllers/VehicleController';
import { ClientController } from './controllers/ClientController'; 
import { ProfileController } from './controllers/ProfileController';
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { can } from './middlewares/can';

const router = Router();

const authController = new AuthController();
const vehicleController = new VehicleController();
const clientController = new ClientController(); 
const profileController = new ProfileController();

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.handle);

// --- ROTAS PROTEGIDAS (Exigem Login) ---
router.get('/me', ensureAuthenticated, profileController.handle);

// --- ROTAS DE CLIENTES ---
// Todos podem LER os clientes, mas só alguns podem MODIFICAR
router.get('/clients', ensureAuthenticated, clientController.list);
router.post('/clients', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST']), clientController.create);
router.put('/clients/:id', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST']), clientController.update); 
router.delete('/clients/:id', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST']), clientController.delete); 

// --- ROTAS DE VEÍCULOS ---
// Todos podem LER os veículos, mas só alguns podem MODIFICAR
router.get('/vehicles', ensureAuthenticated, vehicleController.list);
router.post('/vehicles', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'MECHANIC']), vehicleController.create);
router.put('/vehicles/:id', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'MECHANIC']), vehicleController.update);
router.delete('/vehicles/:id', ensureAuthenticated, can(['ADMIN', 'MANAGER', 'MECHANIC']), vehicleController.delete);

export { router };