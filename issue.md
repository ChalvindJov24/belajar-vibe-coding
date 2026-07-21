# Issue: Unit Test untuk Semua API

## Latar Belakang

Project ini adalah REST API yang dibangun dengan **ElysiaJS + Drizzle ORM + MySQL** menggunakan **Bun** sebagai runtime.

Saat ini belum ada unit test. Kita perlu membuat unit test yang komprehensif untuk semua endpoint API yang tersedia agar kualitas kode terjaga dan regression bisa terdeteksi lebih awal.

---

## Tujuan

Membuat unit test untuk semua API endpoint menggunakan **`bun test`**, disimpan di folder `tests/`.

---

## Ketentuan Umum

- Gunakan `bun test` sebagai test runner (built-in, tidak perlu install tambahan).
- Simpan semua file test di folder `tests/`.
- **Setiap skenario test wajib membersihkan data terlebih dahulu** (truncate/delete tabel `sessions` dan `users`) sebelum menjalankan test-nya, agar hasilnya konsisten dan tidak bergantung pada state sebelumnya.
- Test dilakukan secara **end-to-end via HTTP** menggunakan `fetch()` ke server Elysia yang di-start dalam proses test (atau menggunakan Elysia's `.handle()` method untuk menghindari port conflict).
- Pastikan setiap test case **independen** satu sama lain.

---

## Daftar API yang Harus Di-test

### Struktur Endpoint

| Method   | Endpoint              | Auth Required | Keterangan                  |
|----------|-----------------------|---------------|-----------------------------|
| `GET`    | `/`                   | Tidak         | Health check                |
| `POST`   | `/api/users`          | Tidak         | Register user baru          |
| `POST`   | `/api/users/login`    | Tidak         | Login user                  |
| `GET`    | `/api/users/current`  | Ya (Bearer)   | Ambil data user yang login  |
| `DELETE` | `/api/users/logout`   | Ya (Bearer)   | Logout user (hapus session) |

---

## Skenario Test per Endpoint

### 1. `GET /` — Health Check

- Berhasil mendapatkan response status `200` dengan body yang mengandung informasi status server.

---

### 2. `POST /api/users` — Register User

- **Berhasil** register dengan data valid (name, email, password lengkap dan valid).
- **Gagal** jika email sudah terdaftar (duplikat).
- **Gagal** jika format email tidak valid (bukan format email yang benar).
- **Gagal** jika salah satu field kosong (name, email, atau password kosong).
- **Gagal** jika salah satu field melebihi 255 karakter.
- **Gagal** jika request body tidak lengkap / field wajib tidak dikirim.

---

### 3. `POST /api/users/login` — Login User

- **Berhasil** login dengan email dan password yang benar, response mengandung token.
- **Gagal** jika email tidak terdaftar.
- **Gagal** jika password salah (email benar, password salah).
- **Gagal** jika email atau password kosong.
- **Gagal** jika field email atau password tidak dikirim dalam request body.

---

### 4. `GET /api/users/current` — Get Current User

- **Berhasil** mendapatkan data user jika token valid (session aktif).
- **Gagal** (401) jika token tidak valid / tidak ada session yang cocok.
- **Gagal** (401) jika header `Authorization` tidak disertakan.
- **Gagal** (401) jika header `Authorization` tidak menggunakan format `Bearer <token>`.

---

### 5. `DELETE /api/users/logout` — Logout User

- **Berhasil** logout dengan token yang valid, session terhapus.
- Setelah logout, token yang sama **tidak bisa digunakan lagi** di endpoint `GET /api/users/current`.
- **Gagal** (401) jika token tidak valid.
- **Gagal** (401) jika header `Authorization` tidak disertakan.
- **Gagal** (401) jika header `Authorization` tidak menggunakan format `Bearer <token>`.

---

## Struktur File yang Diharapkan

```
tests/
├── health.test.ts         # Test untuk GET /
├── register.test.ts       # Test untuk POST /api/users
├── login.test.ts          # Test untuk POST /api/users/login
├── current-user.test.ts   # Test untuk GET /api/users/current
└── logout.test.ts         # Test untuk DELETE /api/users/logout
```

---

## Catatan Tambahan

- Gunakan variabel environment yang sama dengan development (`.env`) atau buat `.env.test` khusus jika diperlukan.
- Pastikan koneksi database ditutup setelah semua test selesai agar proses `bun test` tidak hang.
- Tambahkan script `"test": "bun test"` di `package.json` jika belum ada.
