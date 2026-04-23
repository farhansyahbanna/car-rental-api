const mongoose = require('mongoose');
const Car = require('./Car');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - booking
 *         - rating
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *         booking:
 *           type: string
 *         car:
 *           type: string
 *         user:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: Mobil bersih dan nyaman, driver sangat ramah!
 *         categories:
 *           type: object
 *           properties:
 *             cleanliness:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 *             comfort:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 *             service:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 *             value:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 */

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking wajib diisi'],
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Mobil wajib diisi'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User wajib diisi'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating wajib diisi'],
      min: [1, 'Rating minimal 1'],
      max: [5, 'Rating maksimal 5'],
    },
    comment: {
      type: String,
      required: [true, 'Komentar wajib diisi'],
      minlength: [10, 'Komentar minimal 10 karakter'],
      maxlength: [500, 'Komentar maksimal 500 karakter'],
    },
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    images: {
      type: [String],
      default: [],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    reply: {
      text: String,
      repliedAt: Date,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ car: 1 });
reviewSchema.index({ user: 1 });

// Update car rating after saving review
reviewSchema.post('save', async function () {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { car: this.car, isVisible: true } },
    {
      $group: {
        _id: '$car',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Car.findByIdAndUpdate(this.car, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
