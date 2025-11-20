import express from 'express';
import {
  getAllMarks,
  getModelsByMark,
  getAllMarksWithModels
} from '../controllers/vehicleMarkController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de marcas requieren autenticación
router.use(authMiddleware);

// Ruta para obtener todas las marcas
router.get('/', getAllMarks);

// Ruta para obtener todas las marcas con sus modelos
router.get('/with-models', getAllMarksWithModels);

// Ruta para obtener modelos de una marca específica
router.get('/:markId/models', getModelsByMark);

export default router;

