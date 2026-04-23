const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Rental API',
      version: '1.0.0',
      description: `
## Sistem Penyewaan Mobil API

REST API lengkap untuk sistem penyewaan mobil dengan fitur:
- **Autentikasi & Otorisasi** - JWT-based auth dengan role user & admin
- **Manajemen Mobil** - CRUD mobil dengan filter & pencarian
- **Pemesanan** - Buat, kelola, dan batalkan pemesanan
- **Pembayaran** - Proses dan konfirmasi pembayaran
- **Ulasan** - Beri rating dan ulasan pada pemesanan

### Cara Menggunakan
1. Daftar akun baru via \`POST /api/auth/register\`
2. Login via \`POST /api/auth/login\` untuk mendapatkan token
3. Klik tombol **Authorize** dan masukkan token: \`Bearer {your_token}\`
4. Gunakan endpoint sesuai kebutuhan

### Role
- **user** - Pelanggan biasa (bisa menyewa, review)
- **admin** - Admin sistem (kelola semua data)
      `,
      contact: {
        name: 'Car Rental Support',
        email: 'support@carrental.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token. Contoh: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Terjadi kesalahan' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autentikasi pengguna' },
      { name: 'Users', description: 'Manajemen pengguna' },
      { name: 'Cars', description: 'Manajemen data mobil' },
      { name: 'Bookings', description: 'Manajemen pemesanan' },
      { name: 'Payments', description: 'Proses pembayaran' },
      { name: 'Reviews', description: 'Ulasan dan rating' },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
