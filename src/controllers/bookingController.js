const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Private
 */
const getBookings = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = {};

  // User hanya bisa lihat booking miliknya
  if (req.user.role !== 'admin') {
    filter.user = req.user._id;
  }

  if (status) filter.status = status;

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('car', 'name brand type images pricePerDay')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(res, 200, 'Data pemesanan berhasil diambil.', { bookings },
    getPagination(page, limit, total));
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('car')
    .populate('user', 'name email phone');

  if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

  // User hanya bisa lihat booking miliknya
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Akses ditolak.');
  }

  return successResponse(res, 200, 'Data pemesanan berhasil diambil.', { booking });
};

/**
 * @desc    Create booking
 * @route   POST /api/bookings
 * @access  Private/User
 */
const createBooking = async (req, res) => {
  const { car: carId, startDate, endDate, pickupLocation, returnLocation, notes } = req.body;

  const car = await Car.findById(carId);
  if (!car) return errorResponse(res, 404, 'Mobil tidak ditemukan.');
  if (!car.isAvailable) return errorResponse(res, 400, 'Mobil tidak tersedia untuk disewa.');

  // Cek konflik jadwal
  const conflict = await Booking.findOne({
    car: carId,
    status: { $in: ['confirmed', 'active'] },
    $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
  });

  if (conflict) {
    return errorResponse(res, 400, 'Mobil sudah dipesan pada tanggal tersebut.');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) return errorResponse(res, 400, 'Tanggal selesai harus setelah tanggal mulai.');
  if (start < new Date()) return errorResponse(res, 400, 'Tanggal mulai tidak boleh di masa lalu.');

  const booking = await Booking.create({
    user: req.user._id,
    car: carId,
    startDate: start,
    endDate: end,
    pricePerDay: car.pricePerDay,
    pickupLocation,
    returnLocation,
    notes,
  });

  await booking.populate('car', 'name brand type images pricePerDay');

  return successResponse(res, 201, 'Pemesanan berhasil dibuat. Silakan lakukan pembayaran.', { booking });
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

  if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Akses ditolak.');
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    return errorResponse(res, 400, `Pemesanan dengan status '${booking.status}' tidak dapat dibatalkan.`);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Dibatalkan oleh pengguna';
  booking.cancelledAt = new Date();
  await booking.save();

  return successResponse(res, 200, 'Pemesanan berhasil dibatalkan.', { booking });
};

/**
 * @desc    Confirm booking (Admin)
 * @route   PUT /api/bookings/:id/confirm
 * @access  Private/Admin
 */
const confirmBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

  if (booking.status !== 'pending') {
    return errorResponse(res, 400, `Hanya pemesanan berstatus 'pending' yang dapat dikonfirmasi.`);
  }

  booking.status = 'confirmed';
  booking.confirmedAt = new Date();
  await booking.save();
  await booking.populate('car user');

  return successResponse(res, 200, 'Pemesanan berhasil dikonfirmasi.', { booking });
};

/**
 * @desc    Complete booking (Admin)
 * @route   PUT /api/bookings/:id/complete
 * @access  Private/Admin
 */
const completeBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

  if (!['confirmed', 'active'].includes(booking.status)) {
    return errorResponse(res, 400, 'Pemesanan tidak dapat diselesaikan.');
  }

  booking.status = 'completed';
  booking.completedAt = new Date();
  await booking.save();

  return successResponse(res, 200, 'Pemesanan berhasil diselesaikan.', { booking });
};

module.exports = { getBookings, getBooking, createBooking, cancelBooking, confirmBooking, completeBooking };
