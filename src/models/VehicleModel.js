import mongoose from 'mongoose';

const vehicleModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mark: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleMark',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para evitar modelos duplicados por marca
vehicleModelSchema.index({ name: 1, mark: 1 }, { unique: true });

export default mongoose.model('VehicleModel', vehicleModelSchema);

