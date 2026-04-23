const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

/**
 * @desc    Get all reviews (for a car or all)
 * @route   GET /api/reviews
 * @access  Public
 */
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, carId } = req.query;
    const filter = { isVisible: true };
    if (carId) filter.car = carId;

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .populate('car', 'name brand')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return successResponse(res, 200, 'Data ulasan berhasil diambil.', { reviews },
      getPagination(page, limit, total));
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private/User
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, categories } = req.body;

    const booking = await Booking.findById(bookingId).populate('car');
    if (!booking) return errorResponse(res, 404, 'Pemesanan tidak ditemukan.');

    if (booking.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Anda hanya dapat mengulas pemesanan milik sendiri.');
    }

    if (booking.status !== 'completed') {
      return errorResponse(res, 400, 'Ulasan hanya dapat diberikan setelah pemesanan selesai.');
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return errorResponse(res, 400, 'Anda sudah memberikan ulasan untuk pemesanan ini.');
    }

    const review = await Review.create({
      booking: bookingId,
      car: booking.car._id,
      user: req.user._id,
      rating,
      comment,
      categories,
    });

    await review.populate('user', 'name avatar');
    await review.populate('car', 'name brand');

    return successResponse(res, 201, 'Ulasan berhasil ditambahkan.', { review });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private/User
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return errorResponse(res, 404, 'Ulasan tidak ditemukan.');

    if (review.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Akses ditolak.');
    }

    const { rating, comment, categories } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (categories) review.categories = categories;
    await review.save();

    return successResponse(res, 200, 'Ulasan berhasil diperbarui.', { review });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return errorResponse(res, 404, 'Ulasan tidak ditemukan.');

    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Akses ditolak.');
    }

    await review.deleteOne();
    return successResponse(res, 200, 'Ulasan berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Reply to review (Admin)
 * @route   PUT /api/reviews/:id/reply
 * @access  Private/Admin
 */
const replyReview = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return errorResponse(res, 400, 'Teks balasan wajib diisi.');

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply: { text, repliedAt: new Date(), repliedBy: req.user._id } },
      { new: true }
    ).populate('user', 'name avatar');

    if (!review) return errorResponse(res, 404, 'Ulasan tidak ditemukan.');

    return successResponse(res, 200, 'Balasan ulasan berhasil ditambahkan.', { review });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview, replyReview };
