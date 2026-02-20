// backend/src/routes.ts
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { VehicleController } from './controllers/VehicleController';
import { ClientController } from './controllers/ClientController'; 
import { ProfileController } from './controllers/ProfileController';
import { WorkOrderController } from './controllers/WorkOrderController';
import { UserController } from './controllers/UserController'; 
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';
import { can } from './middlewares/can';

const router = Router();

// Instanciando os controllers
const authController = new AuthController();
const vehicleController = new VehicleController();
const clientController = new ClientController(); 
const profileController = new ProfileController();
const workOrderController = new WorkOrderController();
const userController = new UserController(); 

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.handle);

// --- ROTAS PROTEGIDAS (Exigem Login) ---
router.get('/me', ensureAuthenticated, profileController.handle);

// --- MÓDULO DE USUÁRIOS (SYS_ADMIN) ---
router.get('/users', ensureAuthenticated, can(['SYS_ADMIN']), userController.list);
router.post('/users', ensureAuthenticated, can(['SYS_ADMIN']), userController.create);
router.put('/users/:id', ensureAuthenticated, can(['SYS_ADMIN']), userController.update);
router.patch('/users/:id/password', ensureAuthenticated, can(['SYS_ADMIN']), userController.changePassword);

// --- MÓDULO DE CLIENTES ---
const clientRoles = ['SYS_ADMIN', 'ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST'];
router.get('/clients', ensureAuthenticated, clientController.list);
router.post('/clients', ensureAuthenticated, can(clientRoles), clientController.create);
router.put('/clients/:id', ensureAuthenticated, can(clientRoles), clientController.update); 
router.delete('/clients/:id', ensureAuthenticated, can(clientRoles), clientController.delete); 

// --- MÓDULO DE VEÍCULOS ---
const vehicleRoles = ['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC', 'RECEPTIONIST'];
router.get('/vehicles', ensureAuthenticated, vehicleController.list);
router.post('/vehicles', ensureAuthenticated, can(vehicleRoles), vehicleController.create);
router.put('/vehicles/:id', ensureAuthenticated, can(vehicleRoles), vehicleController.update);
router.delete('/vehicles/:id', ensureAuthenticated, can(vehicleRoles), vehicleController.delete);

// ==========================================================
// --- MÓDULO DE ORDENS DE SERVIÇO (O.S. AVANÇADA) ---
// ==========================================================

// 1. Listagem e Dossiê (Todos podem ler)
router.get('/work-orders', ensureAuthenticated, workOrderController.list);
router.get('/work-orders/:id', ensureAuthenticated, workOrderController.show);

// 2. Abertura (Recepção e Gerência)
router.post('/work-orders', ensureAuthenticated, can(['SYS_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST']), workOrderController.create);

// 3. Atualizações (Mecânicos e Gerência)
router.patch('/work-orders/:id/status', ensureAuthenticated, can(['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC']), workOrderController.updateStatus);
router.put('/work-orders/:id/details', ensureAuthenticated, can(['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC']), workOrderController.updateDetails);

// 4. Adicionar Serviços e Peças (Mecânicos e Gerência)
router.post('/work-orders/:id/services', ensureAuthenticated, can(['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC']), workOrderController.addService);
router.post('/work-orders/:id/parts', ensureAuthenticated, can(['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC']), workOrderController.addPart);

export { router };