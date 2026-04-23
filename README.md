# 🚗 Car Rental API

REST API lengkap untuk sistem penyewaan mobil, dibangun dengan **Node.js + Express + MongoDB**, siap deploy ke **Vercel**.

## ✨ Fitur

- 🔐 **Autentikasi JWT** — Register, Login, Refresh Token, Logout
- 🚗 **Manajemen Mobil** — CRUD dengan filter lengkap & cek ketersediaan
- 📅 **Pemesanan** — Buat, konfirmasi, selesaikan, batalkan
- 💰 **Pembayaran** — Submit bukti bayar, verifikasi oleh admin, refund
- ⭐ **Ulasan & Rating** — Review per pemesanan, balas ulasan, rating otomatis
- 👥 **Manajemen User** — Profil, role admin/user, dashboard stats
- 📚 **Swagger UI** — Dokumentasi interaktif lengkap
- 🔒 **Security** — Helmet, CORS, Rate Limiting
- ☁️ **Siap Deploy** — Konfigurasi Vercel included

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/car-rental-api.git
cd car-rental-api
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

### 3. Jalankan Development
```bash
npm run dev
```

Server berjalan di: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/api-docs`

---

## ⚙️ Environment Variables

| Variable | Deskripsi | Wajib |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key untuk access token | ✅ |
| `JWT_EXPIRE` | Durasi access token (default: `7d`) | ❌ |
| `JWT_REFRESH_SECRET` | Secret key untuk refresh token | ✅ |
| `JWT_REFRESH_EXPIRE` | Durasi refresh token (default: `30d`) | ❌ |
| `PORT` | Port server (default: `5000`) | ❌ |
| `NODE_ENV` | Environment (`development`/`production`) | ❌ |
| `APP_URL` | URL aplikasi (untuk Swagger docs) | ❌ |
| `FRONTEND_URL` | URL frontend (untuk CORS) | ❌ |

---

## 📚 API Endpoints

### 🔐 Auth
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Daftar akun baru | - |
| POST | `/api/auth/login` | Login | - |
| GET | `/api/auth/me` | Profil saya | User |
| POST | `/api/auth/refresh` | Refresh token | - |
| POST | `/api/auth/logout` | Logout | User |
| PUT | `/api/auth/update-password` | Ganti password | User |

### 🚗 Cars
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/cars` | Daftar mobil + filter | - |
| GET | `/api/cars/:id` | Detail mobil | - |
| GET | `/api/cars/:id/availability` | Cek ketersediaan | - |
| POST | `/api/cars` | Tambah mobil | Admin |
| PUT | `/api/cars/:id` | Edit mobil | Admin |
| DELETE | `/api/cars/:id` | Hapus mobil | Admin |

### 📅 Bookings
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/bookings` | Daftar pemesanan | User/Admin |
| GET | `/api/bookings/:id` | Detail pemesanan | User/Admin |
| POST | `/api/bookings` | Buat pemesanan | User |
| PUT | `/api/bookings/:id/cancel` | Batalkan | User/Admin |
| PUT | `/api/bookings/:id/confirm` | Konfirmasi | Admin |
| PUT | `/api/bookings/:id/complete` | Selesaikan | Admin |

### 💰 Payments
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/payments` | Riwayat pembayaran | User/Admin |
| GET | `/api/payments/:id` | Detail pembayaran | User/Admin |
| POST | `/api/payments` | Buat pembayaran | User |
| PUT | `/api/payments/:id/verify` | Verifikasi | Admin |
| PUT | `/api/payments/:id/refund` | Refund | Admin |

### ⭐ Reviews
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/reviews` | Semua ulasan | - |
| POST | `/api/reviews` | Buat ulasan | User |
| PUT | `/api/reviews/:id` | Edit ulasan | User |
| DELETE | `/api/reviews/:id` | Hapus ulasan | User/Admin |
| PUT | `/api/reviews/:id/reply` | Balas ulasan | Admin |

### 👥 Users
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/users/stats` | Dashboard stats | Admin |
| PUT | `/api/users/profile` | Edit profil | User |
| GET | `/api/users` | Semua pengguna | Admin |
| GET | `/api/users/:id` | Detail pengguna | Admin |
| PUT | `/api/users/:id` | Edit user | Admin |
| DELETE | `/api/users/:id` | Hapus user | Admin |

---

## ☁️ Deploy ke Vercel

### Cara 1: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET

# Deploy production
vercel --prod
```

### Cara 2: Via GitHub + Vercel Dashboard
1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Import Project**
3. Pilih repository Anda
4. Tambahkan environment variables di **Settings → Environment Variables**
5. Klik **Deploy**

> ⚠️ **Penting**: Pastikan `MONGODB_URI` menggunakan MongoDB Atlas (cloud), bukan localhost.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Docs**: Swagger UI (swagger-jsdoc + swagger-ui-express)
- **Security**: Helmet, CORS, express-rate-limit
- **Deploy**: Vercel

---

## 📁 Struktur Proyek

```
car-rental-api/
├── src/
│   ├── config/
│   │   ├── database.js      # Koneksi MongoDB
│   │   └── swagger.js       # Konfigurasi Swagger
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect & authorize
│   │   └── errorHandler.js  # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── jwt.js           # JWT helper
│   │   └── response.js      # Response helper
│   └── index.js             # Entry point
├── .env.example
├── .gitignore
├── vercel.json
├── package.json
└── README.md
```

## 📝 Format Response

Semua response mengikuti format standar:

```json
// Success
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Error
{
  "success": false,
  "message": "Pesan error.",
  "errors": [ { "field": "email", "message": "Email tidak valid" } ]
}
```
