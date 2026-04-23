const express = require('express');
const router = express.Router();
const { getCars, getCar, createCar, updateCar, deleteCar, checkAvailability } = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Ambil semua data mobil dengan filter
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [sedan, suv, mpv, hatchback, pickup, van] }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: Filter berdasarkan merek (case-insensitive)
 *       - in: query
 *         name: transmission
 *         schema: { type: string, enum: [manual, automatic] }
 *       - in: query
 *         name: fuel
 *         schema: { type: string, enum: [bensin, diesel, hybrid, electric] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: integer }
 *         description: Harga minimum per hari
 *       - in: query
 *         name: maxPrice
 *         schema: { type: integer }
 *         description: Harga maksimum per hari
 *       - in: query
 *         name: seats
 *         schema: { type: integer }
 *       - in: query
 *         name: isAvailable
 *         schema: { type: boolean }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Cari berdasarkan nama, merek, atau tipe
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "Contoh: pricePerDay:asc atau rating:desc"
 *     responses:
 *       200:
 *         description: Daftar mobil
 */
router.get('/', getCars);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Ambil detail satu mobil
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail mobil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     car: { $ref: '#/components/schemas/Car' }
 *       404:
 *         description: Mobil tidak ditemukan
 */
router.get('/:id', getCar);

/**
 * @swagger
 * /api/cars/{id}/availability:
 *   get:
 *     summary: Cek ketersediaan mobil pada rentang tanggal tertentu
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *         example: "2024-12-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *         example: "2024-12-05"
 *     responses:
 *       200:
 *         description: Status ketersediaan beserta estimasi harga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable: { type: boolean }
 *                     duration: { type: integer }
 *                     estimatedPrice: { type: number }
 */
router.get('/:id/availability', checkAvailability);

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Tambah mobil baru (Admin)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, type, year, licensePlate, pricePerDay, seats, transmission, fuel]
 *             properties:
 *               name: { type: string, example: Toyota Avanza }
 *               brand: { type: string, example: Toyota }
 *               model: { type: string, example: Avanza G }
 *               type: { type: string, enum: [sedan, suv, mpv, hatchback, pickup, van] }
 *               year: { type: integer, example: 2022 }
 *               licensePlate: { type: string, example: B 1234 ABC }
 *               color: { type: string, example: Putih }
 *               pricePerDay: { type: number, example: 350000 }
 *               seats: { type: integer, example: 7 }
 *               transmission: { type: string, enum: [manual, automatic] }
 *               fuel: { type: string, enum: [bensin, diesel, hybrid, electric] }
 *               mileage: { type: number, example: 15000 }
 *               features: { type: array, items: { type: string }, example: ["AC", "GPS", "Bluetooth"] }
 *               description: { type: string }
 *               location: { type: string, example: Jakarta Selatan }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Mobil berhasil ditambahkan
 *       403:
 *         description: Bukan admin
 */
router.post('/', protect, authorize('admin'), createCar);

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update data mobil (Admin)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Mobil berhasil diperbarui
 *       404:
 *         description: Mobil tidak ditemukan
 *   delete:
 *     summary: Hapus mobil (Admin)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mobil berhasil dihapus
 *       400:
 *         description: Mobil masih memiliki pemesanan aktif
 */
router.put('/:id', protect, authorize('admin'), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
