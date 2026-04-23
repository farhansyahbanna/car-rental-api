const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         paymentCode:
 *           type: string
 *           example: PAY-20241201-001
 *         booking:
 *           type: string
 *           description: ID pemesanan
 *         user:
 *           type: string
 *           description: ID pengguna
 *         amount:
 *           type: number
 *           example: 1400000
 *         method:
 *           type: string
 *           enum: [transfer_bank, kartu_kredit, kartu_debit, e_wallet, tunai]
 *           example: transfer_bank
 *         status:
 *           type: string
 *           enum: [pending, success, failed, refunded]
 *           default: pending
 *         proofOfPayment:
 *           type: string
 *           description: URL bukti pembayaran
 *         bankName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         transactionId:
 *           type: string
 *         paidAt:
 *           type: string
 *           format: date-time
 */

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking wajib diisi'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User wajib diisi'],
    },
    amount: {
      type: Number,
      required: [true, 'Jumlah pembayaran wajib diisi'],
      min: [0, 'Jumlah tidak boleh negatif'],
    },
    method: {
      type: String,
      required: [true, 'Metode pembayaran wajib diisi'],
      enum: ['transfer_bank', 'kartu_kredit', 'kartu_debit', 'e_wallet', 'tunai'],
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    proofOfPayment: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
    },
    refundReason: {
      type: String,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate payment code
paymentSchema.pre('save', async function (next) {
  if (!this.paymentCode) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentCode = `PAY-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
