const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview, replyReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Ambil semua ulasan
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: carId
 *         schema: { type: string }
 *         description: Filter ulasan berdasarkan ID mobil
 *     responses:
 *       200:
 *         description: Daftar ulasan
 */
router.get('/', getReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Buat ulasan untuk pemesanan yang sudah selesai
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating, comment]
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID pemesanan yang sudah selesai
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 example: Mobil bersih dan nyaman, pelayanan sangat memuaskan!
 *               categories:
 *                 type: object
 *                 properties:
 *                   cleanliness: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *                   comfort: { type: integer, minimum: 1, maximum: 5, example: 4 }
 *                   service: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *                   value: { type: integer, minimum: 1, maximum: 5, example: 4 }
 *     responses:
 *       201:
 *         description: Ulasan berhasil ditambahkan
 *       400:
 *         description: Pemesanan belum selesai atau sudah diulas
 */
router.post('/', protect, authorize('user'), createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Perbarui ulasan sendiri
 *     tags: [Reviews]
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
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Ulasan berhasil diperbarui
 *   delete:
 *     summary: Hapus ulasan
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ulasan berhasil dihapus
 */
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

/**
 * @swagger
 * /api/reviews/{id}/reply:
 *   put:
 *     summary: Balas ulasan pelanggan (Admin)
 *     tags: [Reviews]
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
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Terima kasih atas ulasan positif Anda! Kami senang Anda puas dengan pelayanan kami.
 *     responses:
 *       200:
 *         description: Balasan berhasil ditambahkan
 */
router.put('/:id/reply', protect, authorize('admin'), replyReview);

module.exports = router;
