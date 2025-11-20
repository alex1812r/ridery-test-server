# Ridery Backend

Backend API para el sistema Ridery, construido con **Node.js**, **Express** y **MongoDB** siguiendo **Clean Architecture**.

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture**, separando las responsabilidades en capas:

- **Routes**: Definición de endpoints y middlewares de autenticación
- **Controllers**: Manejo de peticiones HTTP y respuestas
- **Services**: Lógica de negocio y reglas de dominio
- **Models**: Esquemas de base de datos (Mongoose)
- **Middleware**: Funciones intermedias (autenticación, validación)
- **Config**: Configuraciones (DB, Swagger, etc.)

## 📁 Estructura del Proyecto

```
server/
├── src/
│   ├── config/              # Configuraciones del sistema
│   │   ├── db.js            # Conexión a MongoDB
│   │   └── swagger.js       # Configuración de Swagger/OpenAPI
│   │
│   ├── controllers/         # Controladores HTTP (Capa de Presentación)
│   │   ├── authController.js      # Autenticación y usuarios
│   │   ├── dashboardController.js # Indicadores del dashboard
│   │   ├── vehicleController.js   # Gestión de vehículos
│   │   └── vehicleMarkController.js # Gestión de marcas y modelos
│   │
│   ├── services/            # Lógica de Negocio (Capa de Dominio)
│   │   ├── authService.js         # Servicios de autenticación
│   │   ├── dashboardService.js    # Agregaciones y métricas
│   │   ├── emailService.js        # Envío de correos (Nodemailer)
│   │   ├── vehicleService.js      # Lógica de vehículos
│   │   └── vehicleMarkService.js  # Lógica de marcas y modelos
│   │
│   ├── models/              # Modelos de Base de Datos
│   │   ├── User.js          # Modelo de Usuario (email, password, reset tokens)
│   │   ├── VehicleMark.js   # Modelo de Marca de Vehículo
│   │   ├── VehicleModel.js  # Modelo de Modelo de Vehículo (relación con VehicleMark)
│   │   └── Vehicle.js       # Modelo de Vehículo (relaciones con VehicleMark y VehicleModel)
│   │
│   ├── routes/              # Definición de Rutas
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── dashboardRoutes.js     # /api/dashboard/*
│   │   ├── vehicleRoutes.js       # /api/vehicles/*
│   │   └── vehicleMarkRoutes.js  # /api/vehicle-marks/*
│   │
│   ├── middleware/          # Middlewares personalizados
│   │   └── authMiddleware.js      # Validación de JWT
│   │
│   ├── docs/                # Documentación
│   │   └── swagger/
│   │       └── swagger.yaml        # Documentación OpenAPI 3.0
│   │
│   ├── utils/               # Utilidades y helpers
│   │
│   ├── app.js               # Configuración de Express
│   ├── server.js            # Punto de entrada del servidor
│   └── seed.js              # Script para poblar la BD con datos de prueba
│
├── .dockerignore            # Archivos excluidos del build de Docker
├── Dockerfile                # Imagen Docker del backend
├── package.json
└── .env                      # Variables de entorno (no versionado)
```

## 🔑 Módulos y Funcionalidades

### 1. Módulo de Autenticación (`/api/auth`)

**Rutas:**
- `POST /api/auth/register` - Registro de nuevos usuarios
- `POST /api/auth/login` - Login y obtención de token JWT
- `PUT /api/auth/profile` - Actualizar email del usuario (requiere auth)
- `PUT /api/auth/change-password` - Cambiar contraseña (requiere auth)
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/recovery-password` - Restablecer contraseña con token

**Archivos:**
- `controllers/authController.js` - Maneja las peticiones HTTP
- `services/authService.js` - Lógica de negocio (registro, login, JWT, recuperación)
- `services/emailService.js` - Envío de correos de recuperación (Nodemailer + Mailtrap)
- `routes/authRoutes.js` - Definición de rutas y protección con middleware

**Características:**
- Hash de contraseñas con bcryptjs
- Tokens JWT con expiración configurable
- Recuperación de contraseña con tokens temporales (1 hora)
- Envío de correos con enlaces de recuperación

### 2. Módulo de Vehículos (`/api/vehicles`)

**Rutas:**
- `GET /api/vehicles` - Listar vehículos con paginación, ordenamiento y filtros (requiere auth)
- `GET /api/vehicles/:id` - Obtener un vehículo por ID (requiere auth)
- `POST /api/vehicles` - Crear nuevo vehículo (requiere auth)
- `PUT /api/vehicles/:id` - Actualizar vehículo completo (requiere auth)
- `DELETE /api/vehicles/:id` - Eliminar vehículo (requiere auth)
- `PATCH /api/vehicles/:id/status` - Actualizar solo el estado (requiere auth)

**Archivos:**
- `controllers/vehicleController.js` - Maneja las peticiones HTTP
- `services/vehicleService.js` - Lógica de negocio (CRUD, paginación, validaciones, filtros)
- `models/Vehicle.js` - Esquema de vehículo con relaciones a VehicleMark y VehicleModel
- `routes/vehicleRoutes.js` - Definición de rutas protegidas
- `utils/vehicleUtils.js` - Utilidades para generar IDs únicos (VEH-XXXX)

**Características:**
- Paginación server-side con `page` y `limit`
- Ordenamiento por múltiples campos (vehicleId, mark, model, year, status, createdAt)
- Filtros de búsqueda:
  - Búsqueda unificada en marca, modelo e ID único
  - Filtro por rango de años (yearFrom, yearTo)
- Relaciones con VehicleMark y VehicleModel (populate automático)
- ID único generado automáticamente (formato: VEH-0001, VEH-0002, etc.)
- Estados: `available`, `maintenance`, `service`
- Tracking de usuario que crea/actualiza (createdBy, updatedBy)

### 3. Módulo de Marcas y Modelos (`/api/vehicle-marks`)

**Rutas:**
- `GET /api/vehicle-marks` - Obtener todas las marcas (requiere auth)
- `GET /api/vehicle-marks/with-models` - Obtener marcas con sus modelos (requiere auth)
- `GET /api/vehicle-marks/:markId/models` - Obtener modelos de una marca específica (requiere auth)

**Archivos:**
- `controllers/vehicleMarkController.js` - Maneja las peticiones HTTP
- `services/vehicleMarkService.js` - Lógica de negocio para marcas y modelos
- `models/VehicleMark.js` - Esquema de marca de vehículo
- `models/VehicleModel.js` - Esquema de modelo con relación a VehicleMark
- `routes/vehicleMarkRoutes.js` - Definición de rutas protegidas

**Características:**
- Estructura relacional: VehicleModel pertenece a VehicleMark
- Índices únicos para evitar duplicados
- Ordenamiento alfabético por nombre
- Populate automático de relaciones

### 4. Módulo de Dashboard (`/api/dashboard`)

**Rutas:**
- `GET /api/dashboard/metrics` - Indicadores del dashboard (requiere auth)

**Archivos:**
- `controllers/dashboardController.js` - Maneja las peticiones HTTP
- `services/dashboardService.js` - Agregaciones de MongoDB para métricas
- `routes/dashboardRoutes.js` - Definición de rutas protegidas

**Características:**
- Métricas usando agregaciones de Mongoose:
  - Total de usuarios
  - Total de vehículos registrados
  - Vehículos activos (status: available)
- Consultas optimizadas con `Promise.all`

## 🔐 Seguridad

- **JWT**: Autenticación basada en tokens
- **bcryptjs**: Hash de contraseñas (salt rounds: 10)
- **Middleware de autenticación**: Valida token en cada petición protegida
- **Validación de datos**: Validaciones en servicios antes de persistir
- **Tokens de recuperación**: Tokens aleatorios de 32 bytes con expiración de 1 hora

## 📧 Envío de Correos

El sistema utiliza **Nodemailer** con **Mailtrap** para envío de correos:

- **Servicio**: `services/emailService.js`
- **Configuración**: Variables de entorno (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- **Uso actual**: Envío de correos de recuperación de contraseña
- **Formato**: HTML con diseño responsive y versión texto plano

### 📬 Ver Correos Enviados en Mailtrap

El proyecto está configurado para usar **Mailtrap** como servicio de prueba de correos. Los correos enviados (como los de recuperación de contraseña) **NO se envían a direcciones reales**, sino que se capturan en la bandeja de entrada de Mailtrap.

**Para ver los correos enviados:**

1. Accede a [https://mailtrap.io/](https://mailtrap.io/)
2. Inicia sesión con las siguientes credenciales:
   - **Email**: `alex1812r+2025@gmail.com`
   - **Password**: `Alexander123456.`
3. Una vez dentro, ve a la sección **"Email Sandbox"** o **"Inboxes"**
4. Los correos enviados aparecerán en la bandeja de entrada de prueba
5. Puedes hacer clic en cualquier correo para ver su contenido completo, incluyendo el enlace de recuperación de contraseña

**Nota**: Los correos enviados desde la aplicación (como los de recuperación de contraseña) se capturan automáticamente en Mailtrap y no se envían a direcciones de correo reales. Esto es ideal para desarrollo y pruebas sin enviar correos reales.

## 📚 Documentación API (Swagger)

Documentación interactiva disponible en: **http://localhost:5000/api-docs**

- **Formato**: OpenAPI 3.0 (YAML)
- **Ubicación**: `src/docs/swagger/swagger.yaml`
- **Configuración**: `src/config/swagger.js`
- **Características**:
  - Interfaz visual para explorar endpoints
  - Probar endpoints directamente desde el navegador
  - Autenticación JWT integrada
  - Ejemplos de request/response
  - Esquemas de datos documentados

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto `server/` con las siguientes variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ridery

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu-secret-key-super-segura-aqui
JWT_EXPIRES_IN=7d

# SMTP (Mailtrap para desarrollo)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=87dd3400f35e72
SMTP_PASS=tu-contraseña-de-mailtrap-aquí
SMTP_FROM=noreply@ridery.com

# Frontend URL (para enlaces en correos)
FRONTEND_URL=http://localhost:5173
```

**Notas sobre variables de entorno:**
- `MONGODB_URI`: Con Docker, será sobrescrito automáticamente para usar el servicio interno
- `PORT`: Puede ser sobrescrito por docker-compose si es necesario
- `SMTP_PASS`: Reemplaza con tu contraseña real de Mailtrap
- `JWT_SECRET`: Usa una clave segura y aleatoria en producción
- `FRONTEND_URL`: Actualiza con la URL real de tu frontend en producción

3. **Asegurarse de que MongoDB esté corriendo**

## 💻 Uso

### Desarrollo:
```bash
npm run dev
```

### Producción:
```bash
npm start
```

### Poblar base de datos con datos de prueba:
```bash
npm run seed
```

Esto creará:
- 1 usuario administrador (email: `admin@ridery.com`, password: `admin123`)
- 15 marcas de vehículos (Toyota, Honda, Ford, Chevrolet, Nissan, etc.)
- ~150 modelos de vehículos distribuidos entre las marcas
- 25 vehículos de prueba con diferentes marcas, modelos, años y estados

## 🐳 Docker

El proyecto incluye configuración Docker:

```bash
# Construir y levantar todos los servicios
docker compose up --build

# Levantar en segundo plano
docker compose up -d

# Ver logs
docker compose logs -f backend
```

**Nota**: Las variables de entorno se cargan desde `./server/.env` automáticamente.

## 📦 Tecnologías

- **Express**: Framework web para Node.js
- **Mongoose**: ODM para MongoDB
- **bcryptjs**: Hash de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **nodemailer**: Envío de correos
- **cors**: Manejo de CORS
- **dotenv**: Variables de entorno
- **swagger-jsdoc**: Generación de documentación Swagger
- **swagger-ui-express**: Interfaz UI para Swagger
- **js-yaml**: Parser para archivos YAML

## 🧹 Linting y Formateo

```bash
# Verificar errores de linting
npm run lint

# Corregir errores automáticamente
npm run lint:fix

# Formatear código
npm run format

# Verificar formato
npm run format:check
```

## 🔄 Cómo Funciona la Aplicación

### Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **JWT Token**: El backend genera un token JWT con expiración de 7 días
3. **Almacenamiento**: El frontend guarda el token en `localStorage`
4. **Peticiones Protegidas**: El interceptor de Axios agrega el token en el header `Authorization: Bearer <token>`
5. **Validación**: El `authMiddleware` valida el token en cada petición protegida
6. **Expiración**: Si el token expira o es inválido, el frontend redirige al login

### Flujo de Gestión de Vehículos

1. **Listado**: 
   - Frontend solicita vehículos con paginación, ordenamiento y filtros
   - Backend consulta MongoDB con populate de `mark` y `model`
   - Retorna vehículos con objetos poblados (marca y modelo completos)

2. **Creación**:
   - Frontend obtiene marcas desde `GET /api/vehicle-marks`
   - Usuario selecciona marca → Frontend carga modelos desde `GET /api/vehicle-marks/:markId/models`
   - Usuario completa formulario y envía ObjectIds de `mark` y `model`
   - Backend valida que el modelo pertenezca a la marca
   - Genera ID único (VEH-XXXX) y crea el vehículo

3. **Actualización**:
   - Similar a creación, pero actualiza vehículo existente
   - Valida relaciones marca-modelo

4. **Eliminación**:
   - Frontend muestra modal de confirmación
   - Backend elimina vehículo por ID

### Flujo de Recuperación de Contraseña

1. **Solicitud**: Usuario ingresa email en `forgot-password`
2. **Token**: Backend genera token aleatorio de 32 bytes y lo guarda en el usuario
3. **Expiración**: Token expira en 1 hora
4. **Email**: Backend envía correo con enlace usando Nodemailer + Mailtrap
5. **Recuperación**: Usuario hace clic en enlace → Frontend valida token → Usuario ingresa nueva contraseña
6. **Actualización**: Backend actualiza contraseña y limpia token

### Estructura de Datos Relacional

```
VehicleMark (Marca)
  ├── _id: ObjectId
  └── name: String

VehicleModel (Modelo)
  ├── _id: ObjectId
  ├── name: String
  └── mark: ObjectId → VehicleMark

Vehicle (Vehículo)
  ├── _id: ObjectId
  ├── vehicleId: String (VEH-0001)
  ├── mark: ObjectId → VehicleMark
  ├── model: ObjectId → VehicleModel
  ├── year: Number
  ├── status: Enum ['available', 'maintenance', 'service']
  ├── createdBy: ObjectId → User
  └── updatedBy: ObjectId → User
```

### Búsqueda y Filtros

- **Búsqueda unificada**: Busca en `mark.name`, `model.name` y `vehicleId` usando regex case-insensitive
- **Filtro por años**: Rango con `yearFrom` y `yearTo` usando operadores `$gte` y `$lte`
- **Ordenamiento**: Soporta ordenamiento por campos directos y relaciones (con ordenamiento en memoria)

## 📝 Convenciones de Código

- **Código limpio**: Variables en inglés, comentarios en español
- **Clean Architecture**: Separación de responsabilidades por capas
- **ES Modules**: Uso de `import/export`
- **Async/Await**: Manejo asíncrono moderno
- **Validaciones robustas**: Validación de datos en servicios
- **Manejo de errores**: Try/catch con códigos de estado apropiados
