import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';

const ACTIVE_STATUS = 'available';

/**
 * Obtiene los indicadores del dashboard utilizando aggregations de MongoDB
 * @returns {Promise<{totalUsers:number,totalVehicles:number,activeVehicles:number}>}
 */
export const getDashboardMetrics = async () => {
  // Ejecutar aggregations en paralelo para optimizar tiempos de respuesta
  const [usersAggregation, vehiclesAggregation] = await Promise.all([
    User.aggregate([
      {
        $count: 'totalUsers'
      }
    ]),
    Vehicle.aggregate([
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          activeVehicles: {
            $sum: {
              $cond: [{ $eq: ['$status', ACTIVE_STATUS] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalVehicles: 1,
          activeVehicles: 1
        }
      }
    ])
  ]);

  const totalUsers = usersAggregation[0]?.totalUsers || 0;
  const vehicleMetrics = vehiclesAggregation[0] || { totalVehicles: 0, activeVehicles: 0 };

  return {
    totalUsers,
    totalVehicles: vehicleMetrics.totalVehicles || 0,
    activeVehicles: vehicleMetrics.activeVehicles || 0
  };
};

