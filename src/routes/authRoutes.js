import express from 'express';
import {
  register,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  recoveryPassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para registro de nuevos usuarios
router.post('/register', register);

// Ruta para login de usuarios
router.post('/login', login);

// Ruta para solicitar recuperación de contraseña (pública)
router.post('/forgot-password', forgotPassword);

// Ruta para restablecer contraseña con token (pública)
router.post('/recovery-password', recoveryPassword);

// Rutas protegidas que requieren autenticación
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;
