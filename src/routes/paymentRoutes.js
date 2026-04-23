const express = require('express');
const router = express.Router();
const { getPayments, getPayment, createPayment, verifyPayment, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Ambil riwayat pembayaran
 *     tags: [Payments]
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
 *         schema: { type: string, enum: [pending, success, failed, refunded] }
 *     responses:
 *       200:
 *         description: Daftar pembayaran
 */
router.get('/', protect, getPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Ambil detail pembayaran
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pembayaran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment: { $ref: '#/components/schemas/Payment' }
 */
router.get('/:id', protect, getPayment);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Buat pembayaran untuk pemesanan
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, method]
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID pemesanan yang ingin dibayar
 *               method:
 *                 type: string
 *                 enum: [transfer_bank, kartu_kredit, kartu_debit, e_wallet, tunai]
 *                 example: transfer_bank
 *               bankName:
 *                 type: string
 *                 example: BCA
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               accountName:
 *                 type: string
 *                 example: Budi Santoso
 *               transactionId:
 *                 type: string
 *                 description: ID transaksi dari bank (opsional)
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pembayaran berhasil dibuat, menunggu verifikasi
 *       400:
 *         description: Pemesanan sudah dibayar atau dibatalkan
 */
router.post('/', protect, authorize('user'), createPayment);

/**
 * @swagger
 * /api/payments/{id}/verify:
 *   put:
 *     summary: Verifikasi pembayaran (Admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *                 example: success
 *               notes:
 *                 type: string
 *                 example: Pembayaran dikonfirmasi
 *     responses:
 *       200:
 *         description: Pembayaran berhasil diverifikasi
 */
router.put('/:id/verify', protect, authorize('admin'), verifyPayment);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   put:
 *     summary: Proses refund pembayaran (Admin)
 *     tags: [Payments]
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
 *               refundAmount:
 *                 type: number
 *                 description: Jumlah refund (default = jumlah pembayaran penuh)
 *               refundReason:
 *                 type: string
 *                 example: Pemesanan dibatalkan karena kerusakan mobil
 *     responses:
 *       200:
 *         description: Refund berhasil diproses
 */
router.put('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
