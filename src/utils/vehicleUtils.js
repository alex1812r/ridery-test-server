import Vehicle from '../models/Vehicle.js';

/**
 * Genera un ID único para un vehículo en formato VEH-XXXX
 * Busca el último vehículo en la base de datos y genera el siguiente ID secuencial
 * @returns {Promise<string>} ID único del vehículo (ej: VEH-0001, VEH-0025)
 */
export const generateVehicleId = async () => {
  // Buscar el último vehículo ordenado por vehicleId descendente
  const lastVehicle = await Vehicle.findOne()
    .sort({ vehicleId: -1 })
    .select('vehicleId');

  let nextNumber = 1;

  if (lastVehicle && lastVehicle.vehicleId) {
    // Extraer el número del último ID (ej: "VEH-0025" -> 25)
    const match = lastVehicle.vehicleId.match(/VEH-(\d+)/);
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Formatear el ID con ceros a la izquierda (ej: VEH-0001, VEH-0025)
  return formatVehicleId(nextNumber);
};

/**
 * Formatea un número como ID de vehículo en formato VEH-XXXX
 * @param {number} number - Número a formatear
 * @returns {string} ID formateado (ej: VEH-0001, VEH-0025)
 */
export const formatVehicleId = (number) => {
  return `VEH-${String(number).padStart(4, '0')}`;
};

/**
 * Genera un ID único para un vehículo basándose en un índice
 * Útil para seed o casos donde se conoce el número secuencial
 * @param {number} index - Índice del vehículo (0-based)
 * @returns {string} ID único del vehículo (ej: VEH-0001 para index 0)
 */
export const generateVehicleIdFromIndex = (index) => {
  // index es 0-based, pero el ID debe empezar desde 1
  return formatVehicleId(index + 1);
};

