import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import vehicleMarkRoutes from './routes/vehicleMarkRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Configuración de Express
const app = express();

// Middleware para CORS (sin restricciones por ahora)
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de vehículos (protegidas por authMiddleware)
app.use('/api/vehicles', vehicleRoutes);

// Rutas de marcas y modelos de vehículos (protegidas por authMiddleware)
app.use('/api/vehicle-marks', vehicleMarkRoutes);

// Rutas del dashboard (indicadores e insights)
app.use('/api/dashboard', dashboardRoutes);

export default app;
