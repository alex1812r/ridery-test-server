import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el archivo YAML con los paths
const swaggerPaths = yaml.load(
  readFileSync(join(__dirname, '../docs/swagger/swagger.yaml'), 'utf8')
);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ridery API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión de vehículos Ridery',
      contact: {
        name: 'Ridery Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Servidor de desarrollo'
      }
    ],
    paths: swaggerPaths.paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido del endpoint de login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            }
          }
        },
        VehicleMark: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID de MongoDB de la marca'
            },
            name: {
              type: 'string',
              description: 'Nombre de la marca',
              example: 'Toyota'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        VehicleModel: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID de MongoDB del modelo'
            },
            name: {
              type: 'string',
              description: 'Nombre del modelo',
              example: 'Corolla'
            },
            mark: {
              $ref: '#/components/schemas/VehicleMark'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Vehicle: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID de MongoDB del vehículo'
            },
            vehicleId: {
              type: 'string',
              description: 'ID único del vehículo en formato VEH-XXXX',
              example: 'VEH-0001'
            },
            mark: {
              $ref: '#/components/schemas/VehicleMark',
              description: 'Marca del vehículo (objeto poblado)'
            },
            model: {
              $ref: '#/components/schemas/VehicleModel',
              description: 'Modelo del vehículo (objeto poblado)'
            },
            year: {
              type: 'number',
              description: 'Año del vehículo',
              minimum: 1900
            },
            status: {
              type: 'string',
              enum: ['available', 'maintenance', 'service'],
              description: 'Estado del vehículo'
            },
            createdBy: {
              $ref: '#/components/schemas/User'
            },
            updatedBy: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['vehicleId', 'mark', 'model', 'year', 'status', 'createdBy']
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            error: {
              type: 'string',
              description: 'Detalle del error'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación'
      },
      {
        name: 'Vehicles',
        description: 'Endpoints de gestión de vehículos'
      },
      {
        name: 'VehicleMarks',
        description: 'Endpoints de gestión de marcas y modelos de vehículos'
      },
      {
        name: 'Dashboard',
        description: 'Endpoints del dashboard'
      },
      {
        name: 'Health',
        description: 'Endpoints de estado del servidor'
      }
    ]
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
