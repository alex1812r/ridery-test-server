import * as authService from '../services/authService.js';

/**
 * Controlador para registro de nuevos usuarios
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Llamar al servicio para registrar el usuario
    const result = await authService.registerUser(email, password);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error en registro:', error);

    // Determinar el código de estado según el tipo de error
    // Si el servicio estableció un statusCode (409, 401), usarlo, sino 400 o 500
    const statusCode =
      error.statusCode ||
      (error.message.includes('requerido') || error.message.includes('inválido') ? 400 : 500);

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * Controlador para login de usuarios
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Llamar al servicio para autenticar el usuario
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result
    });
  } catch (error) {
    console.error('Error en login:', error);

    // Determinar el código de estado según el tipo de error
    // 400 para credenciales inválidas, 401 solo para errores de autenticación de token
    const statusCode = error.statusCode || 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Controlador para actualizar el perfil del usuario
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    // Llamar al servicio para actualizar el perfil
    const result = await authService.updateUserProfile(userId, profileData);

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);

    const statusCode =
      error.statusCode ||
      (error.message.includes('requerido') || error.message.includes('inválido') ? 400 : 500);

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar el perfil',
      error: error.message
    });
  }
};

/**
 * Controlador para cambiar la contraseña del usuario
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Llamar al servicio para cambiar la contraseña
    const result = await authService.changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);

    const statusCode = error.statusCode || 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};

/**
 * Controlador para solicitar recuperación de contraseña
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Llamar al servicio para generar el token de recuperación
    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);

    const statusCode =
      error.statusCode ||
      (error.message.includes('requerido') || error.message.includes('inválido') ? 400 : 500);

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al solicitar recuperación de contraseña',
      error: error.message
    });
  }
};

/**
 * Controlador para restablecer la contraseña con token
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const recoveryPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Llamar al servicio para restablecer la contraseña
    const result = await authService.recoveryPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);

    const statusCode = error.statusCode || 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al restablecer la contraseña',
      error: error.message
    });
  }
};
