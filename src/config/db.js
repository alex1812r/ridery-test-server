import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ridery';

    const options = {
      // Opciones de conexión recomendadas para Mongoose
    };

    await mongoose.connect(mongoURI, options);

    console.log(`📦 Conectado a MongoDB: ${mongoURI}`);
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw error;
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('error', err => {
  console.error('Error de conexión a MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Desconectado de MongoDB');
});
