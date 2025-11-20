import * as vehicleService from '../services/vehicleService.js';

/**
 * Lista todos los vehículos con paginación, ordenamiento y filtros
 * GET /api/vehicles?page=1&limit=10&sortBy=mark&sortOrder=asc&mark=Toyota&model=Corolla&vehicleId=VEH-0001&yearFrom=2020&yearTo=2023
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const listVehicles = async (req, res) => {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extraer parámetros de ordenamiento (por defecto: createdAt desc)
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Extraer parámetros de filtros
    const filters = {
      search: req.query.search,
      yearFrom: req.query.yearFrom,
      yearTo: req.query.yearTo
    };

    // Llamar al servicio para obtener los vehículos
    const result = await vehicleService.listVehicles(page, limit, sortBy, sortOrder, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al listar vehículos:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al obtener la lista de vehículos',
      error: error.message
    });
  }
};

/**
 * Crea un nuevo vehículo
 * POST /api/vehicles
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const createVehicle = async (req, res) => {
  try {
    const { mark, model, year, status } = req.body;
    const userId = req.userId; // Obtenido del authMiddleware

    // Llamar al servicio para crear el vehículo
    const vehicle = await vehicleService.createVehicle({ mark, model, year, status }, userId);

    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // Determinar código de estado: 400 para errores de validación, 500 para otros
    const statusCode =
      error.message.includes('requerido') ||
      error.message.includes('inválido') ||
      error.message.includes('debe ser')
        ? 400
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al crear el vehículo',
      error: error.message
    });
  }
};

/**
 * Actualiza el estado de un vehículo
 * PATCH /api/vehicles/:id/status
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId; // Obtenido del authMiddleware

    // Llamar al servicio para actualizar el estado del vehículo
    const vehicle = await vehicleService.updateVehicleStatus(id, status, userId);

    res.status(200).json({
      success: true,
      message: 'Estado del vehículo actualizado exitosamente',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error al actualizar estado del vehículo:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // Manejar errores de cast (ID inválido)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de vehículo inválido'
      });
    }

    // Determinar código de estado según el tipo de error
    const statusCode =
      error.statusCode ||
      (error.message.includes('requerido') ||
      error.message.includes('inválido') ||
      error.message.includes('debe ser')
        ? 400
        : 500);

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar el estado del vehículo',
      error: error.message
    });
  }
};

/**
 * Obtiene un vehículo por su ID
 * GET /api/vehicles/:id
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para obtener el vehículo
    const vehicle = await vehicleService.getVehicleById(id);

    res.status(200).json({
      success: true,
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);

    // Manejar errores de cast (ID inválido)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de vehículo inválido'
      });
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al obtener el vehículo',
      error: error.message
    });
  }
};

/**
 * Actualiza un vehículo
 * PUT /api/vehicles/:id
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { mark, model, year, status } = req.body;
    const userId = req.userId; // Obtenido del authMiddleware

    // Llamar al servicio para actualizar el vehículo
    const vehicle = await vehicleService.updateVehicle(
      id,
      { mark, model, year, status },
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // Manejar errores de cast (ID inválido)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de vehículo inválido'
      });
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar el vehículo',
      error: error.message
    });
  }
};

/**
 * Elimina un vehículo
 * DELETE /api/vehicles/:id
 * Maneja la petición HTTP y delega la lógica de negocio al servicio
 */
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para eliminar el vehículo
    await vehicleService.deleteVehicle(id);

    res.status(200).json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);

    // Manejar errores de cast (ID inválido)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de vehículo inválido'
      });
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al eliminar el vehículo',
      error: error.message
    });
  }
};
