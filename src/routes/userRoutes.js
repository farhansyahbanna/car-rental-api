const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateProfile, updateUser, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Ambil statistik dashboard (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUsers: { type: integer }
 *                         totalCars: { type: integer }
 *                         totalBookings: { type: integer }
 *                         totalRevenue: { type: number }
 *                     bookingStats:
 *                       type: object
 *                     recentBookings:
 *                       type: array
 */
router.get('/stats', protect, authorize('admin'), getDashboardStats);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profil pengguna yang sedang login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Budi Santoso }
 *               phone: { type: string, example: "081234567890" }
 *               avatar: { type: string, description: URL foto profil }
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string, example: Jl. Merdeka No. 10 }
 *                   city: { type: string, example: Jakarta }
 *                   province: { type: string, example: DKI Jakarta }
 *                   zipCode: { type: string, example: "12345" }
 *               drivingLicense:
 *                 type: object
 *                 properties:
 *                   number: { type: string, example: SIM-1234567890 }
 *                   expiryDate: { type: string, format: date, example: "2026-12-31" }
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 */
router.put('/profile', protect, updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua pengguna (Admin)
 *     tags: [Users]
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
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Cari berdasarkan nama, email, atau telepon
 *     responses:
 *       200:
 *         description: Daftar pengguna
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil detail pengguna (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pengguna
 *       404:
 *         description: Pengguna tidak ditemukan
 *   put:
 *     summary: Update role/status pengguna (Admin)
 *     tags: [Users]
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
 *               role: { type: string, enum: [user, admin] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui
 *   delete:
 *     summary: Hapus pengguna (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus
 */
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
