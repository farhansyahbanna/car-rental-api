const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unik pengguna
 *         name:
 *           type: string
 *           description: Nama lengkap
 *           example: Budi Santoso
 *         email:
 *           type: string
 *           format: email
 *           example: budi@example.com
 *         phone:
 *           type: string
 *           example: "081234567890"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *         avatar:
 *           type: string
 *           description: URL foto profil
 *         address:
 *           type: object
 *           properties:
 *             street: { type: string }
 *             city: { type: string }
 *             province: { type: string }
 *             zipCode: { type: string }
 *         drivingLicense:
 *           type: object
 *           properties:
 *             number: { type: string }
 *             expiryDate: { type: string, format: date }
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
      maxlength: [100, 'Nama maksimal 100 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Nomor telepon wajib diisi'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      province: String,
      zipCode: String,
    },
    drivingLicense: {
      number: String,
      expiryDate: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpire;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
