import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware para validar el token JWT en las peticiones
 * Verifica que el token sea válido y que el usuario exista
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    // El formato esperado es: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no válido'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar el usuario al objeto request para uso en los controladores
    req.user = user;
    req.userId = decoded.userId;

    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación expirado'
      });
    }

    console.error('Error en authMiddleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar autenticación',
      error: error.message
    });
  }
};
