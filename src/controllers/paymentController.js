const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = {};

  if (req.user.role !== 'admin') filter.user = req.user._id;
  if (status) filter.status = status;

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('booking', 'bookingCode startDate endDate totalPrice')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(res, 200, 'Data pembayaran berhasil diambil.', { payments },
    getPagination(page, limit, total));
};

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'name email phone');

  if (!payment) return errorResponse(res, 404, 'Pembayaran tidak ditemukan.');

  if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Akses ditolak.');
  }

  return successResponse(res, 200, 'Data pembayaran berhasil diambil.', { payment });
};

/**
 * @desc    Create payment
 * @route   POST /api/payments
 * @access  Private/User
 */
const createPayment = async (req, res) => {
  const { bookingId, method, bankName, accountNumber, accountName, transactionId, notes } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

  if (booking.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Akses ditolak.');
  }

  if (booking.paymentStatus === 'paid') {
    return errorResponse(res, 400, 'Pemesanan ini sudah dibayar.');
  }

  if (booking.status === 'cancelled') {
    return errorResponse(res, 400, 'Pemesanan telah dibatalkan.');
  }

  const payment = await Payment.create({
    booking: bookingId,
    user: req.user._id,
    amount: booking.totalPrice,
    method,
    bankName,
    accountNumber,
    accountName,
    transactionId,
    notes,
    status: 'pending',
  });

  await payment.populate('booking', 'bookingCode totalPrice');

  return successResponse(res, 201, 'Pembayaran berhasil dibuat. Menunggu verifikasi admin.', { payment });
};

/**
 * @desc    Verify payment (Admin)
 * @route   PUT /api/payments/:id/verify
 * @access  Private/Admin
 */
const verifyPayment = async (req, res) => {
  const { status, notes } = req.body;

  if (!['success', 'failed'].includes(status)) {
    return errorResponse(res, 400, "Status harus 'success' atau 'failed'.");
  }

  const payment = await Payment.findById(req.params.id);
  if (!payment) return errorResponse(res, 404, 'Pembayaran tidak ditemukan.');

  if (payment.status !== 'pending') {
    return errorResponse(res, 400, 'Pembayaran ini sudah diverifikasi.');
  }

  payment.status = status;
  payment.verifiedBy = req.user._id;
  payment.verifiedAt = new Date();
  if (notes) payment.notes = notes;
  if (status === 'success') payment.paidAt = new Date();
  await payment.save();

  // Update booking payment status
  if (status === 'success') {
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid' });
  }

  await payment.populate('booking user');

  return successResponse(res, 200,
    status === 'success' ? 'Pembayaran berhasil diverifikasi.' : 'Pembayaran ditolak.',
    { payment });
};

/**
 * @desc    Refund payment (Admin)
 * @route   PUT /api/payments/:id/refund
 * @access  Private/Admin
 */
const refundPayment = async (req, res) => {
  const { refundAmount, refundReason } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) return errorResponse(res, 404, 'Pembayaran tidak ditemukan.');

  if (payment.status !== 'success') {
    return errorResponse(res, 400, 'Hanya pembayaran yang sudah sukses yang dapat direfund.');
  }

  payment.status = 'refunded';
  payment.refundAmount = refundAmount || payment.amount;
  payment.refundReason = refundReason;
  payment.refundedAt = new Date();
  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded' });

  return successResponse(res, 200, 'Refund berhasil diproses.', { payment });
};

module.exports = { getPayments, getPayment, createPayment, verifyPayment, refundPayment };
