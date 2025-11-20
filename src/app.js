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

// Configuración de CORS con URLs permitidas desde variable de entorno
// ALLOWED_ORIGINS puede contener múltiples URLs separadas por comas
// Ejemplo: "http://localhost:5173,https://mi-app.render.com,https://mi-app.github.io"
const getAllowedOrigins = () => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  
  // Si no hay variable de entorno, permitir todas en desarrollo
  if (!allowedOriginsEnv) {
    return process.env.NODE_ENV === 'production' ? [] : ['*'];
  }
  
  // Parsear las URLs separadas por comas y limpiar espacios
  return allowedOriginsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
};

const allowedOrigins = getAllowedOrigins();

// Configurar CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Si se permite todo en desarrollo
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
