import VehicleMark from '../models/VehicleMark.js';
import VehicleModel from '../models/VehicleModel.js';

/**
 * Obtiene todas las marcas de vehículos
 * @returns {Promise<Array>} Lista de marcas
 */
export const getAllMarks = async () => {
  const marks = await VehicleMark.find().sort({ name: 1 });
  return marks;
};

/**
 * Obtiene todos los modelos de una marca específica
 * @param {string} markId - ID de la marca
 * @returns {Promise<Array>} Lista de modelos
 */
export const getModelsByMark = async (markId) => {
  if (!markId) {
    throw new Error('El ID de la marca es requerido');
  }

  const models = await VehicleModel.find({ mark: markId })
    .populate('mark', 'name')
    .sort({ name: 1 });
  
  return models;
};

/**
 * Obtiene todas las marcas con sus modelos
 * @returns {Promise<Array>} Lista de marcas con sus modelos
 */
export const getAllMarksWithModels = async () => {
  const marks = await VehicleMark.find().sort({ name: 1 });
  
  const marksWithModels = await Promise.all(
    marks.map(async (mark) => {
      const models = await VehicleModel.find({ mark: mark._id }).sort({ name: 1 });
      return {
        ...mark.toObject(),
        models
      };
    })
  );
  
  return marksWithModels;
};

