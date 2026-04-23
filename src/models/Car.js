const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *         - brand
 *         - type
 *         - year
 *         - licensePlate
 *         - pricePerDay
 *         - seats
 *         - transmission
 *         - fuel
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Toyota Avanza
 *         brand:
 *           type: string
 *           example: Toyota
 *         model:
 *           type: string
 *           example: Avanza
 *         type:
 *           type: string
 *           enum: [sedan, suv, mpv, hatchback, pickup, van]
 *           example: mpv
 *         year:
 *           type: integer
 *           example: 2022
 *         licensePlate:
 *           type: string
 *           example: B 1234 ABC
 *         color:
 *           type: string
 *           example: Putih
 *         pricePerDay:
 *           type: number
 *           example: 350000
 *         seats:
 *           type: integer
 *           example: 7
 *         transmission:
 *           type: string
 *           enum: [manual, automatic]
 *         fuel:
 *           type: string
 *           enum: [bensin, diesel, hybrid, electric]
 *         mileage:
 *           type: number
 *           example: 15000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["AC", "GPS", "Bluetooth", "Backup Camera"]
 *         isAvailable:
 *           type: boolean
 *           default: true
 *         location:
 *           type: string
 *           example: Jakarta Selatan
 *         rating:
 *           type: number
 *           example: 4.5
 *         totalReviews:
 *           type: integer
 *           example: 12
 */

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama mobil wajib diisi'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Merek mobil wajib diisi'],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipe mobil wajib diisi'],
      enum: {
        values: ['sedan', 'suv', 'mpv', 'hatchback', 'pickup', 'van'],
        message: 'Tipe mobil tidak valid',
      },
    },
    year: {
      type: Number,
      required: [true, 'Tahun mobil wajib diisi'],
      min: [1990, 'Tahun minimal 1990'],
      max: [new Date().getFullYear() + 1, 'Tahun tidak valid'],
    },
    licensePlate: {
      type: String,
      required: [true, 'Nomor plat wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Harga per hari wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    seats: {
      type: Number,
      required: [true, 'Jumlah kursi wajib diisi'],
      min: [1, 'Jumlah kursi minimal 1'],
      max: [20, 'Jumlah kursi maksimal 20'],
    },
    transmission: {
      type: String,
      required: [true, 'Transmisi wajib diisi'],
      enum: ['manual', 'automatic'],
    },
    fuel: {
      type: String,
      required: [true, 'Bahan bakar wajib diisi'],
      enum: ['bensin', 'diesel', 'hybrid', 'electric'],
    },
    mileage: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      maxlength: [500, 'Deskripsi maksimal 500 karakter'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search performance
carSchema.index({ brand: 'text', name: 'text', type: 'text', location: 'text' });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ isAvailable: 1 });
carSchema.index({ type: 1 });

module.exports = mongoose.model('Car', carSchema);
