import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de dashboard requieren autenticación y JWT válido
router.use(authMiddleware);

// GET /api/dashboard/metrics
router.get('/metrics', getDashboardMetrics);

export default router;

