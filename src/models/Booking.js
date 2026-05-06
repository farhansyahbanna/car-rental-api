const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - car
 *         - startDate
 *         - endDate
 *         - pickupLocation
 *         - returnLocation
 *       properties:
 *         _id:
 *           type: string
 *         bookingCode:
 *           type: string
 *           example: BK-20241201-001
 *         user:
 *           type: string
 *           description: ID pengguna
 *         car:
 *           type: string
 *           description: ID mobil
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-12-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-05"
 *         duration:
 *           type: integer
 *           description: Jumlah hari
 *           example: 4
 *         totalPrice:
 *           type: number
 *           example: 1400000
 *         status:
 *           type: string
 *           enum: [pending, confirmed, active, completed, cancelled]
 *           default: pending
 *         pickupLocation:
 *           type: string
 *           example: Kantor Jakarta Selatan
 *         returnLocation:
 *           type: string
 *           example: Kantor Jakarta Selatan
 *         notes:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *           default: unpaid
 */

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User wajib diisi'],
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Mobil wajib diisi'],
    },
    startDate: {
      type: Date,
      required: [true, 'Tanggal mulai wajib diisi'],
    },
    endDate: {
      type: Date,
      required: [true, 'Tanggal selesai wajib diisi'],
    },
    duration: {
      type: Number,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickupLocation: {
      type: String,
      required: [true, 'Lokasi pengambilan wajib diisi'],
    },
    returnLocation: {
      type: String,
      required: [true, 'Lokasi pengembalian wajib diisi'],
    },
    notes: {
      type: String,
      maxlength: [300, 'Catatan maksimal 300 karakter'],
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate booking code
bookingSchema.pre('save', async function () {
  if (!this.bookingCode) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingCode = `BK-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  // Calculate duration and total price
  if (this.startDate && this.endDate) {
    const diff = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    this.duration = diff > 0 ? diff : 1;
    this.totalPrice = this.duration * this.pricePerDay;
  }
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ bookingCode: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
