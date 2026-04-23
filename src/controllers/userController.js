const User = require('../models/User');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return successResponse(res, 200, 'Data pengguna berhasil diambil.', { users },
      getPagination(page, limit, total));
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan.');
    return successResponse(res, 200, 'Data pengguna berhasil diambil.', { user });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update user profile (own)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'drivingLicense', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return successResponse(res, 200, 'Profil berhasil diperbarui.', { user });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update user by admin
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan.');

    return successResponse(res, 200, 'Data pengguna berhasil diperbarui.', { user });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, 400, 'Tidak dapat menghapus akun sendiri.');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan.');

    return successResponse(res, 200, 'Pengguna berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get dashboard stats (Admin)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const Car = require('../models/Car');
    const Payment = require('../models/Payment');

    const [totalUsers, totalCars, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Car.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('car', 'name brand')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 200, 'Statistik dashboard berhasil diambil.', {
      stats: {
        totalUsers,
        totalCars,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      bookingStats: bookingStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      recentBookings,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getUsers, getUser, updateProfile, updateUser, deleteUser, getDashboardStats };
