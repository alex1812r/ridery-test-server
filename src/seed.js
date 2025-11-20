import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import VehicleMark from './models/VehicleMark.js';
import VehicleModel from './models/VehicleModel.js';
import { generateVehicleIdFromIndex } from './utils/vehicleUtils.js';

dotenv.config();

// Datos de marcas y modelos (mismo que en el frontend)
const vehicleMarksData = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Volkswagen', 'BMW',
  'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Jeep', 'Tesla'
];

const vehicleModelsData = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra', '4Runner', 'Sienna', 'Yaris'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Ridgeline', 'Passport', 'Fit', 'Insight'],
  'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Fusion', 'Focus'],
  'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Traverse', 'Malibu', 'Camaro', 'Corvette', 'Trailblazer', 'Blazer'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Murano', 'Maxima', 'Versa'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Arteon', 'Taos', 'ID.4', 'Beetle', 'CC'],
  'BMW': ['Serie 3', 'Serie 5', 'Serie 7', 'X3', 'X5', 'X7', 'Serie 1', 'Serie 4', 'X1', 'X6'],
  'Mercedes-Benz': ['Clase C', 'Clase E', 'Clase S', 'GLC', 'GLE', 'GLS', 'Clase A', 'Clase B', 'GLA', 'GLB'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Veloster', 'Genesis', 'Ioniq'],
  'Kia': ['Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride', 'Soul', 'Rio', 'Stinger', 'Niro', 'Carnival'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'CX-3', 'MX-5 Miata', 'CX-50', 'Tribute', 'B-Series'],
  'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Ascent', 'Impreza', 'Legacy', 'WRX', 'BRZ', 'Tribeca', 'Baja'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer', 'Grand Wagoneer', 'Patriot', 'Liberty'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Roadster', 'Cybertruck', 'Semi', 'Model 3 Performance', 'Model S Plaid', 'Model X Plaid']
};

/**
 * Script para poblar la base de datos con datos de prueba
 */
const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('📦 Conectado a MongoDB para seed');

    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await VehicleModel.deleteMany({});
    await VehicleMark.deleteMany({});
    console.log('🧹 Colecciones limpiadas');

    // Crear usuario admin
    const adminUser = await User.create({
      email: 'admin@ridery.com',
      password: 'admin123' // Se hasheará automáticamente
    });
    console.log('✅ Usuario admin creado:', adminUser.email);

    // Crear marcas
    console.log('\n📝 Creando marcas...');
    const createdMarks = {};
    for (const markName of vehicleMarksData) {
      const mark = await VehicleMark.create({ name: markName });
      createdMarks[markName] = mark;
      console.log(`   ✓ ${markName}`);
    }
    console.log(`✅ ${vehicleMarksData.length} marcas creadas`);

    // Crear modelos
    console.log('\n📝 Creando modelos...');
    const createdModels = {};
    let totalModels = 0;
    for (const [markName, models] of Object.entries(vehicleModelsData)) {
      const mark = createdMarks[markName];
      if (!mark) continue;

      createdModels[markName] = {};
      for (const modelName of models) {
        const model = await VehicleModel.create({
          name: modelName,
          mark: mark._id
        });
        createdModels[markName][modelName] = model;
        totalModels++;
      }
      console.log(`   ✓ ${markName}: ${models.length} modelos`);
    }
    console.log(`✅ ${totalModels} modelos creados`);

    // Crear 25 vehículos de prueba variados
    console.log('\n📝 Creando vehículos...');
    const statuses = ['available', 'maintenance', 'service'];
    const createdVehicles = [];
    
    for (let index = 0; index < 25; index++) {
      const markNames = Object.keys(createdMarks);
      const markName = markNames[index % markNames.length];
      const mark = createdMarks[markName];
      
      const modelNames = Object.keys(createdModels[markName]);
      const modelName = modelNames[index % modelNames.length];
      const model = createdModels[markName][modelName];
      
      const year = 2015 + (index % 10);
      const status = statuses[index % statuses.length];
      const vehicleId = generateVehicleIdFromIndex(index);

      const vehicle = await Vehicle.create({
        vehicleId,
        mark: mark._id,
        model: model._id,
        year,
        status,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      });

      createdVehicles.push(vehicle);
    }
    console.log(`✅ ${createdVehicles.length} vehículos creados`);

    // Mostrar resumen
    console.log('\n📊 Resumen del seed:');
    console.log(`   - Usuarios: ${await User.countDocuments()}`);
    console.log(`   - Marcas: ${await VehicleMark.countDocuments()}`);
    console.log(`   - Modelos: ${await VehicleModel.countDocuments()}`);
    console.log(`   - Vehículos: ${await Vehicle.countDocuments()}`);

    console.log('\n✨ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
