const User = require('../models/User');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'Email sudah terdaftar.');
  }

  const user = await User.create({ name, email, password, phone });
  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  return successResponse(res, 201, 'Registrasi berhasil.', {
    user,
    accessToken,
    refreshToken,
  });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email dan password wajib diisi.');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 401, 'Email atau password salah.');
  }

  if (!user.isActive) {
    return errorResponse(res, 401, 'Akun Anda telah dinonaktifkan. Hubungi admin.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Email atau password salah.');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });

  const userData = user.toJSON();

  return successResponse(res, 200, 'Login berhasil.', {
    user: userData,
    accessToken,
    refreshToken,
  });
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  return successResponse(res, 200, 'Data profil berhasil diambil.', { user });
};

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return errorResponse(res, 400, 'Refresh token wajib diisi.');
  }

  const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    return errorResponse(res, 401, 'Refresh token tidak valid.');
  }

  const tokens = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return successResponse(res, 200, 'Token diperbarui.', tokens);
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  return successResponse(res, 200, 'Logout berhasil.');
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 400, 'Password lama dan baru wajib diisi.');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'Password baru minimal 6 karakter.');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return errorResponse(res, 400, 'Password lama tidak sesuai.');
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, 200, 'Password berhasil diperbarui.');
};

module.exports = { register, login, getMe, refreshToken, logout, updatePassword };
