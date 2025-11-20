import { getDashboardMetrics as getDashboardMetricsService } from '../services/dashboardService.js';

/**
 * Retorna los indicadores del dashboard (usuarios, vehículos registrados y activos)
 * GET /api/dashboard/metrics
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await getDashboardMetricsService();

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error al obtener indicadores del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los indicadores del dashboard'
    });
  }
};

