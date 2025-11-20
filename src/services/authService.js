import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordRecoveryEmail } from './emailService.js';

/**
 * Genera un token JWT para el usuario
 * @param {string} userId - ID del usuario
 * @returns {string} Token JWT
 */
const generateToken = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Registra un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{user: Object, token: string}>} Usuario creado y token JWT
 * @throws {Error} Si hay errores de validación o el usuario ya existe
 */
export const registerUser = async (email, password) => {
  // Validar campos requeridos
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    throw new Error('Formato de email inválido');
  }

  // Validar longitud mínima de contraseña
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  // Crear nuevo usuario (la contraseña se hasheará automáticamente en el pre-save hook)
  const user = await User.create({
    email: email.toLowerCase(),
    password
  });

  // Generar token JWT
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email
    },
    token
  };
};

/**
 * Autentica un usuario y genera un token
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{user: Object, token: string}>} Usuario y token JWT
 * @throws {Error} Si las credenciales son inválidas
 */
export const loginUser = async (email, password) => {
  // Validar campos requeridos
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  // Buscar usuario por email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 400; // 400 en lugar de 401 para evitar que el frontend cierre la sesión
    throw error;
  }

  // Verificar contraseña
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 400; // 400 en lugar de 401 para evitar que el frontend cierre la sesión
    throw error;
  }

  // Generar token JWT
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email
    },
    token
  };
};

/**
 * Actualiza el perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<{user: Object}>} Usuario actualizado
 * @throws {Error} Si hay errores de validación o el email ya existe
 */
export const updateUserProfile = async (userId, profileData) => {
  const { email } = profileData;

  // Validar que el email esté presente
  if (!email) {
    throw new Error('El email es requerido');
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    throw new Error('Formato de email inválido');
  }

  // Buscar el usuario
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Verificar si el email ya está en uso por otro usuario
  if (email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }
  }

  // Actualizar el email
  user.email = email.toLowerCase();
  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email
    }
  };
};

/**
 * Cambia la contraseña del usuario
 * @param {string} userId - ID del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{message: string}>} Mensaje de éxito
 * @throws {Error} Si la contraseña actual es incorrecta o hay errores de validación
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  // Validar campos requeridos
  if (!currentPassword || !newPassword) {
    throw new Error('La contraseña actual y la nueva contraseña son requeridas');
  }

  // Validar longitud mínima de la nueva contraseña
  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  // Buscar el usuario
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Verificar la contraseña actual
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    const error = new Error('La contraseña actual es incorrecta');
    error.statusCode = 400; // 400 en lugar de 401 para evitar que el frontend cierre la sesión
    throw error;
  }

  // Actualizar la contraseña (se hasheará automáticamente en el pre-save hook)
  user.password = newPassword;
  await user.save();

  return {
    message: 'Contraseña actualizada exitosamente'
  };
};

/**
 * Genera un token de recuperación de contraseña para el usuario
 * @param {string} email - Email del usuario
 * @returns {Promise<{message: string, token: string}>} Mensaje de éxito y token generado
 * @throws {Error} Si el email no existe
 */
export const forgotPassword = async (email) => {
  // Validar que el email esté presente
  if (!email) {
    throw new Error('El email es requerido');
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    throw new Error('Formato de email inválido');
  }

  // Buscar el usuario por email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Por seguridad, no revelamos si el email existe o no
    return {
      message: 'Si el email existe, se enviará un enlace de recuperación'
    };
  }

  // Generar token aleatorio seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Establecer expiración del token (1 hora desde ahora)
  const resetPasswordExpires = new Date();
  resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

  // Guardar token y fecha de expiración en el usuario
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetPasswordExpires;
  await user.save();

  // Enviar correo con el enlace de recuperación
  try {
    await sendPasswordRecoveryEmail(user.email, resetToken);
  } catch (error) {
    // Si falla el envío del correo, loguear el error pero no fallar la operación
    // El token ya está guardado, el usuario puede intentar nuevamente
    console.error('Error al enviar correo de recuperación:', error);
  }

  // Por seguridad, no retornamos el token en la respuesta
  return {
    message: 'Si el email existe, se enviará un enlace de recuperación'
  };
};

/**
 * Restablece la contraseña usando el token de recuperación
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{message: string}>} Mensaje de éxito
 * @throws {Error} Si el token es inválido, expirado o hay errores de validación
 */
export const recoveryPassword = async (token, newPassword) => {
  // Validar campos requeridos
  if (!token || !newPassword) {
    throw new Error('El token y la nueva contraseña son requeridos');
  }

  // Validar longitud mínima de la nueva contraseña
  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  // Buscar usuario con el token válido y no expirado
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() } // Token no expirado
  });

  if (!user) {
    const error = new Error('Token inválido o expirado');
    error.statusCode = 400;
    throw error;
  }

  // Actualizar la contraseña (se hasheará automáticamente en el pre-save hook)
  user.password = newPassword;
  // Limpiar el token de recuperación
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return {
    message: 'Contraseña restablecida exitosamente'
  };
};
