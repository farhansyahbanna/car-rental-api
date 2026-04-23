const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

/**
 * @desc    Get all cars
 * @route   GET /api/cars
 * @access  Public
 */
const getCars = async (req, res) => {
  const {
    page = 1, limit = 10, type, brand, transmission, fuel,
    minPrice, maxPrice, seats, isAvailable, location, search, sort
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (transmission) filter.transmission = transmission;
  if (fuel) filter.fuel = fuel;
  if (seats) filter.seats = parseInt(seats);
  if (location) filter.location = new RegExp(location, 'i');
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { type: new RegExp(search, 'i') },
    ];
  }

  const sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOptions[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const total = await Car.countDocuments(filter);
  const cars = await Car.find(filter)
    .sort(sortOptions)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(res, 200, 'Data mobil berhasil diambil.', { cars },
    getPagination(page, limit, total));
};

/**
 * @desc    Get single car
 * @route   GET /api/cars/:id
 * @access  Public
 */
const getCar = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    return errorResponse(res, 404, 'Mobil tidak ditemukan.');
  }
  return successResponse(res, 200, 'Data mobil berhasil diambil.', { car });
};

/**
 * @desc    Create car
 * @route   POST /api/cars
 * @access  Private/Admin
 */
const createCar = async (req, res) => {
  const car = await Car.create(req.body);
  return successResponse(res, 201, 'Mobil berhasil ditambahkan.', { car });
};

/**
 * @desc    Update car
 * @route   PUT /api/cars/:id
 * @access  Private/Admin
 */
const updateCar = async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!car) {
    return errorResponse(res, 404, 'Mobil tidak ditemukan.');
  }
  return successResponse(res, 200, 'Mobil berhasil diperbarui.', { car });
};

/**
 * @desc    Delete car
 * @route   DELETE /api/cars/:id
 * @access  Private/Admin
 */
const deleteCar = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    return errorResponse(res, 404, 'Mobil tidak ditemukan.');
  }

  const activeBookings = await Booking.countDocuments({
    car: req.params.id,
    status: { $in: ['pending', 'confirmed', 'active'] },
  });

  if (activeBookings > 0) {
    return errorResponse(res, 400, 'Mobil tidak dapat dihapus karena masih ada pemesanan aktif.');
  }

  await car.deleteOne();
  return successResponse(res, 200, 'Mobil berhasil dihapus.');
};

/**
 * @desc    Check car availability
 * @route   GET /api/cars/:id/availability
 * @access  Public
 */
const checkAvailability = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return errorResponse(res, 400, 'Tanggal mulai dan selesai wajib diisi.');
  }

  const car = await Car.findById(req.params.id);
  if (!car) {
    return errorResponse(res, 404, 'Mobil tidak ditemukan.');
  }

  const conflictBooking = await Booking.findOne({
    car: req.params.id,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });

  const isAvailable = !conflictBooking && car.isAvailable;
  const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const estimatedPrice = isAvailable ? duration * car.pricePerDay : null;

  return successResponse(res, 200, `Mobil ${isAvailable ? 'tersedia' : 'tidak tersedia'}.`, {
    isAvailable,
    car: { _id: car._id, name: car.name, pricePerDay: car.pricePerDay },
    duration: isAvailable ? duration : null,
    estimatedPrice,
  });
};

module.exports = { getCars, getCar, createCar, updateCar, deleteCar, checkAvailability };
