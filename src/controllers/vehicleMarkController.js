import * as vehicleMarkService from '../services/vehicleMarkService.js';

/**
 * Obtiene todas las marcas de vehículos
 * GET /api/vehicle-marks
 */
export const getAllMarks = async (req, res) => {
  try {
    const marks = await vehicleMarkService.getAllMarks();

    res.status(200).json({
      success: true,
      data: { marks }
    });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las marcas',
      error: error.message
    });
  }
};

/**
 * Obtiene todos los modelos de una marca específica
 * GET /api/vehicle-marks/:markId/models
 */
export const getModelsByMark = async (req, res) => {
  try {
    const { markId } = req.params;
    const models = await vehicleMarkService.getModelsByMark(markId);

    res.status(200).json({
      success: true,
      data: { models }
    });
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    
    const statusCode = error.message.includes('requerido') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al obtener los modelos',
      error: error.message
    });
  }
};

/**
 * Obtiene todas las marcas con sus modelos
 * GET /api/vehicle-marks/with-models
 */
export const getAllMarksWithModels = async (req, res) => {
  try {
    const marksWithModels = await vehicleMarkService.getAllMarksWithModels();

    res.status(200).json({
      success: true,
      data: { marks: marksWithModels }
    });
  } catch (error) {
    console.error('Error al obtener marcas con modelos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las marcas con modelos',
      error: error.message
    });
  }
};

