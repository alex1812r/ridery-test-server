import express from 'express';
import {
  listVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de vehículos requieren autenticación
router.use(authMiddleware);

// Ruta para listar vehículos (paginado y ordenado por fecha desc)
router.get('/', listVehicles);

// Ruta para obtener un vehículo por ID
router.get('/:id', getVehicle);

// Ruta para crear un nuevo vehículo
router.post('/', createVehicle);

// Ruta para actualizar un vehículo
router.put('/:id', updateVehicle);

// Ruta para actualizar el estado de un vehículo
router.patch('/:id/status', updateVehicleStatus);

// Ruta para eliminar un vehículo
router.delete('/:id', deleteVehicle);

export default router;
