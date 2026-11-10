# Gym Management System - Backend API

Tugas UTS Framework Programming. Backend untuk mengelola pusat kebugaran: **anggota, pelatih, paket keanggotaan, keanggotaan, sesi latihan, dan peserta sesi latihan**.

## Teknologi

NestJS 11 + TypeScript, PostgreSQL 16 (Docker), TypeORM, class-validator, class-transformer, `ValidationPipe`, Postman (pengujian), Jest (unit test).

Library tambahan di luar ketentuan dosen (semua standar dan kecil): `@nestjs/config` (membaca `.env`), `@nestjs/typeorm` (integrasi TypeORM), `@nestjs/mapped-types` (`PartialType`/`OmitType` untuk DTO update), `pg` (driver PostgreSQL).

## Isi repository

```
gym-management-system/
├── docker-compose.yml          # PostgreSQL
├── .env.example                # contoh konfigurasi environment
├── src/
│   ├── main.ts                 # ValidationPipe + filter error global
│   ├── app.module.ts           # koneksi database + semua module
│   ├── common/                 # filter error DB, decorator validasi, utility tanggal
│   └── modules/
│       ├── members/            # masing-masing: entities/, dto/, controller, service, module
│       ├── trainers/
│       ├── membership-plans/
│       ├── memberships/
│       ├── training-sessions/
│       └── session-participants/
└── docs/
    ├── api-specification.md    # spesifikasi API lengkap
    ├── erd.png, erd.md, erd.dot
    ├── penjelasan-kode.md      # panduan memahami kode untuk presentasi
    └── postman/gym-management-system.postman_collection.json
```

## Instalasi dan konfigurasi

### Prasyarat
- Node.js 20 LTS atau lebih baru (`node -v`)
- Docker Desktop yang sedang berjalan (untuk PostgreSQL)
- Postman

### Langkah

```bash
# 1. Masuk ke folder project dan pasang dependensi
cd gym-management-system
npm install

# 2. Buat file .env dari contoh
cp .env.example .env            # macOS/Linux/Git Bash
copy .env.example .env          # Windows CMD

# 3. Nyalakan PostgreSQL (Docker)
docker compose up -d
docker compose ps               # tunggu status "healthy"

# 4. Jalankan aplikasi (tabel dibuat otomatis)
npm run start:dev
```

Server berjalan di `http://localhost:3000`. Tanda berhasil: log berakhir dengan `Nest application successfully started`.

### Environment (`.env`)

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | 3000 | Port aplikasi NestJS |
| `DB_HOST` | localhost | Host PostgreSQL |
| `DB_PORT` | 5432 | Port PostgreSQL (juga dipakai Docker Compose) |
| `DB_USERNAME` | gym_user | User database |
| `DB_PASSWORD` | gym_password | Password database |
| `DB_NAME` | gym_db | Nama database |

Ubah password di `.env` sebelum database pertama kali dibuat. File `.env` tidak di-commit (ada di `.gitignore`).

### Perintah berguna

| Perintah | Fungsi |
|---|---|
| `npm run start:dev` | Jalankan mode development (auto-reload) |
| `npm run build` | Kompilasi TypeScript |
| `npm test` | Jalankan unit test |
| `docker compose stop` | Matikan database, data tetap aman |
| `docker compose down -v` | Hapus container **dan data** (reset total) |
| `docker exec -it gym_postgres psql -U gym_user -d gym_db` | Masuk ke database untuk melihat tabel |

## Pengujian dengan Postman

1. Pastikan server berjalan.
2. Postman → **Import** → pilih `docs/postman/gym-management-system.postman_collection.json`.
3. Klik kanan collection → **Run collection** → jalankan **semua folder berurutan** (1 sampai 8). Request saling bergantung lewat *collection variables* (ID hasil Create dipakai request berikutnya), jadi jangan menjalankan folder secara acak.
4. Collection berisi **92 request** dengan assertion otomatis. Data uji dibersihkan sendiri oleh folder 8, sehingga collection bisa dijalankan berulang kali.

Cakupan skenario (sesuai ketentuan dosen):

| Skenario | Folder |
|---|---|
| Create, get all, get detail, update | 1 - 6 |
| Delete | 8 |
| Validation error | tersebar di setiap folder (mis. 1.8, 3.6, 5.9) |
| Data tidak ditemukan (404) | tersebar (mis. 1.10, 4.15) |
| Duplicate data (409) | 1.6, 1.7, 2.5, 3.5, 6.2 |
| Business rule violation | 6.3, 6.5, 6.8, 6.9 |
| Relationship scenario | folder 7 |

Via command line (opsional, tanpa Postman): `npx newman run docs/postman/gym-management-system.postman_collection.json`.

## Ringkasan API

| Resource | Endpoint |
|---|---|
| Members | `POST/GET /members`, `GET/PATCH/DELETE /members/:id`, `GET /members/:id/memberships` |
| Trainers | `POST/GET /trainers`, `GET/PATCH/DELETE /trainers/:id` |
| Membership Plans | `POST/GET /membership-plans`, `GET/PATCH/DELETE /membership-plans/:id` |
| Memberships | `POST/GET /memberships` (filter `memberId`, `status`), `GET/PATCH/DELETE /memberships/:id` |
| Training Sessions | `POST/GET /training-sessions`, `GET/PATCH/DELETE /training-sessions/:id`, `GET /training-sessions/:id/participants` |
| Session Participants | `POST/GET /session-participants` (filter `trainingSessionId`, `memberId`), `GET/PATCH/DELETE /session-participants/:id` |

Spesifikasi lengkap (field, validasi, contoh request/response, status code): [`docs/api-specification.md`](docs/api-specification.md).

Status code: 200 (GET/PATCH), 201 (POST), 204 (DELETE), 400 (validasi/aturan input), 404 (tidak ditemukan), 409 (duplikat/konflik/data masih dipakai).

## Keputusan desain dan business rule

| Keputusan | Pilihan |
|---|---|
| ID | Integer auto increment |
| Hapus data yang masih dipakai | Ditolak (FK `RESTRICT`) → 409 |
| Status membership | Dihitung dari tanggal (`UPCOMING` / `ACTIVE` / `EXPIRED`), tidak disimpan |
| Tanggal berakhir membership | Dihitung server: `startDate + durationInDays - 1` |
| Kapasitas sesi | Wajib, 1 sampai 500 |
| Daftar sesi | Wajib punya membership aktif pada tanggal sesi; sesi yang sudah dimulai tidak bisa didaftar |
| Peserta sesi | Punya `attendanceStatus` (`REGISTERED`, `ATTENDED`, `ABSENT`); pembatalan lewat DELETE |

Pemetaan lengkap business rule ke kode ada di [`docs/penjelasan-kode.md`](docs/penjelasan-kode.md).

## Catatan teknis dan batasan

- `synchronize: true` membuat tabel otomatis dari entity: cocok untuk development/UTS. Untuk production gunakan migration.
- Pengecekan kapasitas dilakukan di service (hitung peserta lalu simpan) tanpa transaksi/lock. Pada beban sangat tinggi, dua pendaftaran bersamaan pada slot terakhir secara teori bisa lolos keduanya. Duplikasi pendaftaran yang sama tetap dicegah oleh unique constraint database.
- Perbandingan tanggal membership dan sesi memakai zona waktu server.
- Aplikasi NestJS dijalankan langsung dengan `npm`, hanya database yang memakai Docker.

## Pemecahan masalah

| Gejala | Solusi |
|---|---|
| `port is already allocated` / koneksi ke DB aneh | Port 5432 dipakai PostgreSQL lokal. Ubah `DB_PORT=5433` di `.env`, lalu `docker compose down` dan `docker compose up -d`. |
| `password authentication failed` | Volume lama dibuat dengan password berbeda: `docker compose down -v`, lalu `docker compose up -d`. |
| `ECONNREFUSED` saat start | Database belum siap atau Docker Desktop belum menyala. Cek `docker compose ps`. |
| Postman collection banyak gagal | Jalankan dari awal (folder 1) secara berurutan lewat Collection Runner, dengan server aktif. |

## Anggota kelompok

| Nama | NIM | Modul yang dipegang |
|---|---|---|
| (isi) | (isi) | (isi) |
