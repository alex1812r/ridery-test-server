import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB()
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(error => {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  });
