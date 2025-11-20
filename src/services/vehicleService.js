import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import VehicleMark from '../models/VehicleMark.js';
import VehicleModel from '../models/VehicleModel.js';
import { generateVehicleId } from '../utils/vehicleUtils.js';

/**
 * Lista vehículos con paginación, ordenamiento y filtros
 * @param {number} page - Número de página
 * @param {number} limit - Cantidad de elementos por página
 * @param {string} sortBy - Campo por el cual ordenar (mark, model, year, status, createdAt, updatedAt)
 * @param {string} sortOrder - Orden de clasificación ('asc' o 'desc')
 * @param {Object} filters - Objeto con filtros de búsqueda
 * @param {string} filters.search - Búsqueda general en marca, modelo e ID único (búsqueda parcial, case-insensitive)
 * @param {number} filters.yearFrom - Año de fabricación desde
 * @param {number} filters.yearTo - Año de fabricación hasta
 * @returns {Promise<{vehicles: Array, pagination: Object}>} Lista de vehículos e información de paginación
 * @throws {Error} Si los parámetros de paginación o ordenamiento son inválidos
 */
export const listVehicles = async (
  page,
  limit,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  filters = {}
) => {
  // Validar parámetros de paginación
  if (page < 1 || limit < 1) {
    throw new Error('Los parámetros page y limit deben ser números positivos');
  }

  // Campos válidos para ordenar
  const validSortFields = ['vehicleId', 'mark', 'model', 'year', 'status', 'createdAt', 'updatedAt'];

  // Validar campo de ordenamiento
  if (!validSortFields.includes(sortBy)) {
    throw new Error(
      `El campo de ordenamiento debe ser uno de: ${validSortFields.join(', ')}`
    );
  }

  // Validar orden de clasificación
  const normalizedSortOrder = sortOrder.toLowerCase();
  if (normalizedSortOrder !== 'asc' && normalizedSortOrder !== 'desc') {
    throw new Error("El orden de clasificación debe ser 'asc' o 'desc'");
  }

  // Construir objeto de filtros
  const filterObject = {};

  // Búsqueda general en marca, modelo e ID único usando $or
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    const searchRegex = { $regex: searchTerm, $options: 'i' };
    
    // Buscar marcas y modelos que coincidan con el término de búsqueda
    const matchingMarks = await VehicleMark.find({ name: searchRegex }).select('_id');
    const matchingModels = await VehicleModel.find({ name: searchRegex }).select('_id');
    
    const markIds = matchingMarks.map(m => m._id);
    const modelIds = matchingModels.map(m => m._id);
    
    filterObject.$or = [
      { mark: { $in: markIds } },
      { model: { $in: modelIds } },
      { vehicleId: searchRegex }
    ];
  }

  // Filtro por rango de años
  if (filters.yearFrom || filters.yearTo) {
    filterObject.year = {};
    if (filters.yearFrom) {
      const yearFrom = parseInt(filters.yearFrom, 10);
      if (!isNaN(yearFrom)) {
        filterObject.year.$gte = yearFrom;
      }
    }
    if (filters.yearTo) {
      const yearTo = parseInt(filters.yearTo, 10);
      if (!isNaN(yearTo)) {
        filterObject.year.$lte = yearTo;
      }
    }
  }

  // Filtro por status
  if (filters.status && filters.status.trim()) {
    const validStatuses = ['available', 'maintenance', 'service'];
    const status = filters.status.trim();
    if (validStatuses.includes(status)) {
      filterObject.status = status;
    }
  }

  // Convertir 'asc'/'desc' a 1/-1 para Mongoose
  const sortDirection = normalizedSortOrder === 'asc' ? 1 : -1;

  // Construir objeto de ordenamiento
  let sortObject = { [sortBy]: sortDirection };
  
  // Para ordenar por marca o modelo (que son relaciones), ordenamos por createdAt por defecto
  // ya que Mongoose no puede ordenar directamente por campos poblados en la consulta inicial
  // Luego ordenaremos en memoria después del populate
  const needsInMemorySort = sortBy === 'mark' || sortBy === 'model';
  if (needsInMemorySort) {
    sortObject = { createdAt: sortDirection };
  }

  const skip = (page - 1) * limit;

  // Obtener vehículos con paginación, ordenamiento y filtros
  let vehicles = await Vehicle.find(filterObject)
    .populate('mark', 'name')
    .populate('model', 'name')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email')
    .sort(sortObject)
    .skip(skip)
    .limit(limit);

  // Si necesitamos ordenar por marca o modelo, ordenar en memoria después del populate
  if (needsInMemorySort) {
    vehicles = vehicles.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'mark') {
        aValue = a.mark?.name || '';
        bValue = b.mark?.name || '';
      } else if (sortBy === 'model') {
        aValue = a.model?.name || '';
        bValue = b.model?.name || '';
      }
      
      if (aValue < bValue) return sortDirection === 1 ? -1 : 1;
      if (aValue > bValue) return sortDirection === 1 ? 1 : -1;
      return 0;
    });
  }

  // Contar total de vehículos con los mismos filtros
  const total = await Vehicle.countDocuments(filterObject);

  // Calcular información de paginación
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    vehicles,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage
    }
  };
};

/**
 * Valida los datos de un vehículo antes de crearlo
 * @param {Object} vehicleData - Datos del vehículo
 * @throws {Error} Si los datos son inválidos
 */
const validateVehicleData = async (vehicleData) => {
  const { mark, model, year, status } = vehicleData;

  // Validar campos requeridos
  if (!mark || !model || !year) {
    throw new Error('Los campos mark, model y year son requeridos');
  }

  // Validar que mark y model sean ObjectIds válidos
  if (!mongoose.Types.ObjectId.isValid(mark)) {
    throw new Error('El campo mark debe ser un ID válido');
  }

  if (!mongoose.Types.ObjectId.isValid(model)) {
    throw new Error('El campo model debe ser un ID válido');
  }

  // Verificar que la marca existe
  const markExists = await VehicleMark.findById(mark);
  if (!markExists) {
    throw new Error('La marca especificada no existe');
  }

  // Verificar que el modelo existe y pertenece a la marca
  const modelExists = await VehicleModel.findById(model);
  if (!modelExists) {
    throw new Error('El modelo especificado no existe');
  }

  if (modelExists.mark.toString() !== mark.toString()) {
    throw new Error('El modelo no pertenece a la marca especificada');
  }

  // Validar que year sea un número válido
  if (typeof year !== 'number' || isNaN(year)) {
    throw new Error('El campo year debe ser un número válido');
  }

  // Validar rango del año
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 1) {
    throw new Error(`El año debe estar entre 1900 y ${currentYear + 1}`);
  }

  // Validar status si se proporciona
  const validStatuses = ['available', 'maintenance', 'service'];
  if (status && !validStatuses.includes(status)) {
    throw new Error(`El status debe ser uno de: ${validStatuses.join(', ')}`);
  }
};

/**
 * Crea un nuevo vehículo
 * @param {Object} vehicleData - Datos del vehículo (mark, model, year, status)
 * @param {string} userId - ID del usuario que crea el vehículo
 * @returns {Promise<Object>} Vehículo creado
 * @throws {Error} Si los datos son inválidos o hay errores de validación de Mongoose
 */
export const createVehicle = async (vehicleData, userId) => {
  // Validar datos del vehículo
  await validateVehicleData(vehicleData);

  const { mark, model, year, status } = vehicleData;

  // Generar ID único para el vehículo
  const vehicleId = await generateVehicleId();

  // Crear el vehículo
  const vehicle = await Vehicle.create({
    vehicleId,
    mark,
    model,
    year,
    status: status || 'available',
    createdBy: userId,
    updatedBy: userId
  });

  // Poblar referencias para la respuesta
  await vehicle.populate('mark', 'name');
  await vehicle.populate('model', 'name');
  await vehicle.populate('createdBy', 'email');
  await vehicle.populate('updatedBy', 'email');

  return vehicle;
};

/**
 * Valida el status de un vehículo
 * @param {string} status - Status a validar
 * @throws {Error} Si el status es inválido
 */
const validateStatus = status => {
  if (!status) {
    throw new Error('El campo status es requerido');
  }

  const validStatuses = ['available', 'maintenance', 'service'];
  if (!validStatuses.includes(status)) {
    throw new Error(`El status debe ser uno de: ${validStatuses.join(', ')}`);
  }
};

/**
 * Actualiza el estado de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @param {string} status - Nuevo estado del vehículo
 * @param {string} userId - ID del usuario que actualiza el vehículo
 * @returns {Promise<Object>} Vehículo actualizado
 * @throws {Error} Si el vehículo no existe, el ID es inválido o el status es inválido
 */
export const updateVehicleStatus = async (vehicleId, status, userId) => {
  // Validar status
  validateStatus(status);

  // Validar que el ID sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new Error('ID de vehículo inválido');
  }

  // Buscar y actualizar el vehículo
  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      status,
      updatedBy: userId
    },
    {
      new: true, // Retornar el documento actualizado
      runValidators: true // Ejecutar validaciones del schema
    }
  )
    .populate('mark', 'name')
    .populate('model', 'name')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email');

  // Verificar si el vehículo existe
  if (!vehicle) {
    const error = new Error('Vehículo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

/**
 * Obtiene un vehículo por su ID
 * @param {string} vehicleId - ID del vehículo (MongoDB ObjectId)
 * @returns {Promise<Object>} Vehículo encontrado
 * @throws {Error} Si el vehículo no existe o el ID es inválido
 */
export const getVehicleById = async (vehicleId) => {
  // Validar que el ID sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new Error('ID de vehículo inválido');
  }

  const vehicle = await Vehicle.findById(vehicleId)
    .populate('mark', 'name')
    .populate('model', 'name')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email');

  if (!vehicle) {
    const error = new Error('Vehículo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

/**
 * Actualiza un vehículo
 * @param {string} vehicleId - ID del vehículo (MongoDB ObjectId)
 * @param {Object} vehicleData - Datos del vehículo a actualizar (mark, model, year, status)
 * @param {string} userId - ID del usuario que actualiza el vehículo
 * @returns {Promise<Object>} Vehículo actualizado
 * @throws {Error} Si el vehículo no existe, el ID es inválido o los datos son inválidos
 */
export const updateVehicle = async (vehicleId, vehicleData, userId) => {
  // Validar datos del vehículo
  await validateVehicleData(vehicleData);

  // Validar que el ID sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new Error('ID de vehículo inválido');
  }

  const { mark, model, year, status } = vehicleData;

  // Buscar y actualizar el vehículo
  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      mark,
      model,
      year,
      status: status || 'available',
      updatedBy: userId
    },
    {
      new: true, // Retornar el documento actualizado
      runValidators: true // Ejecutar validaciones del schema
    }
  )
    .populate('mark', 'name')
    .populate('model', 'name')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email');

  // Verificar si el vehículo existe
  if (!vehicle) {
    const error = new Error('Vehículo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

/**
 * Elimina un vehículo
 * @param {string} vehicleId - ID del vehículo (MongoDB ObjectId)
 * @returns {Promise<Object>} Vehículo eliminado
 * @throws {Error} Si el vehículo no existe o el ID es inválido
 */
export const deleteVehicle = async (vehicleId) => {
  // Validar que el ID sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    throw new Error('ID de vehículo inválido');
  }

  const vehicle = await Vehicle.findByIdAndDelete(vehicleId);

  // Verificar si el vehículo existe
  if (!vehicle) {
    const error = new Error('Vehículo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};
