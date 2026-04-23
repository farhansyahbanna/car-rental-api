const express = require('express');
const router = express.Router();
const {
  getBookings, getBooking, createBooking,
  cancelBooking, confirmBooking, completeBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Ambil semua pemesanan (user hanya miliknya, admin semua)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, active, completed, cancelled] }
 *     responses:
 *       200:
 *         description: Daftar pemesanan
 */
router.get('/', protect, getBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Ambil detail pemesanan
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pemesanan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking: { $ref: '#/components/schemas/Booking' }
 *       404:
 *         description: Pemesanan tidak ditemukan
 */
router.get('/:id', protect, getBooking);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Buat pemesanan baru
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [car, startDate, endDate, pickupLocation, returnLocation]
 *             properties:
 *               car:
 *                 type: string
 *                 description: ID mobil
 *                 example: 64f8a1b2c3d4e5f6a7b8c9d0
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-05"
 *               pickupLocation:
 *                 type: string
 *                 example: Kantor Jakarta Selatan
 *               returnLocation:
 *                 type: string
 *                 example: Kantor Jakarta Selatan
 *               notes:
 *                 type: string
 *                 example: Mohon siapkan kursi bayi
 *     responses:
 *       201:
 *         description: Pemesanan berhasil dibuat
 *       400:
 *         description: Mobil tidak tersedia atau tanggal konflik
 */
router.post('/', protect, authorize('user'), createBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Batalkan pemesanan
 *     tags: [Bookings]
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
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Perubahan rencana perjalanan
 *     responses:
 *       200:
 *         description: Pemesanan berhasil dibatalkan
 */
router.put('/:id/cancel', protect, cancelBooking);

/**
 * @swagger
 * /api/bookings/{id}/confirm:
 *   put:
 *     summary: Konfirmasi pemesanan (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pemesanan berhasil dikonfirmasi
 */
router.put('/:id/confirm', protect, authorize('admin'), confirmBooking);

/**
 * @swagger
 * /api/bookings/{id}/complete:
 *   put:
 *     summary: Selesaikan pemesanan (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pemesanan berhasil diselesaikan
 */
router.put('/:id/complete', protect, authorize('admin'), completeBooking);

module.exports = router;
