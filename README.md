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

## Anggota kelompok

| Nama | NIM | Modul yang dipegang |
|---|---|---|
| (isi) | (isi) | (isi) |
