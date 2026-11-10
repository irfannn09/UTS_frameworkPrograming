# API Specification - Gym Management System

Base URL: `http://localhost:3000` (port dapat diubah lewat `PORT` di `.env`)
Format data: JSON (`Content-Type: application/json`).

## 1. Konvensi umum

### Status code

| Kode | Arti | Kapan dipakai |
|---|---|---|
| 200 OK | Berhasil | GET dan PATCH sukses |
| 201 Created | Data dibuat | POST sukses |
| 204 No Content | Berhasil tanpa body | DELETE sukses |
| 400 Bad Request | Input salah | Validasi DTO gagal, `:id` bukan angka, field tidak dikenal, JSON rusak, aturan input dilanggar (jadwal terbalik, sesi sudah lewat, member tanpa membership aktif) |
| 404 Not Found | Data tidak ditemukan | ID tidak ada, termasuk FK yang dirujuk di body (mis. `memberId` tidak ada) |
| 409 Conflict | Bertabrakan dengan data yang ada | Email/HP/nama paket duplikat, sudah terdaftar di sesi, sesi penuh, kapasitas di bawah jumlah peserta, hapus data yang masih dipakai data lain |

### Format error

Semua error berbentuk:

```json
{ "statusCode": 409, "message": "Email budi@example.com sudah terdaftar", "error": "Conflict" }
```

Untuk error validasi, `message` berupa **array** (satu item per pelanggaran):

```json
{
  "message": [
    "email must be an email",
    "phoneNumber must contain 8-15 digits (may start with +)"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Aturan validasi global (ValidationPipe)

- `whitelist` + `forbidNonWhitelisted`: field yang tidak ada di DTO **ditolak** (400).
- `transform`: body diubah menjadi instance DTO (class-transformer).
- Tipe data ketat: ID di body harus **angka** (`1`, bukan `"1"`).
- Tanggal tanpa jam: format `YYYY-MM-DD` dan harus tanggal yang ada di kalender.
- Tanggal dengan jam: ISO 8601, disarankan memakai zona waktu, mis. `2026-11-20T08:00:00+07:00`.

---

## 2. Members

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| fullName | string | Ya | tidak kosong, maks 100 karakter, spasi tepi dibuang |
| email | string | Ya | format email valid, maks 100, diubah ke huruf kecil, **unik** |
| phoneNumber | string | Ya | 8-15 digit, boleh diawali `+`, **unik** |
| dateOfBirth | string | Tidak | `YYYY-MM-DD` |
| address | string | Tidak | maks 255 karakter |

| Method | Endpoint | Request | Sukses | Error |
|---|---|---|---|---|
| POST | `/members` | body: field di atas | 201 + member | 400, 409 (email/HP duplikat) |
| GET | `/members` | - | 200 + array | - |
| GET | `/members/:id` | path `id` (integer) | 200 + member | 400 (id bukan angka), 404 |
| GET | `/members/:id/memberships` | path `id` | 200 + array membership beserta `status` dan `membershipPlan` | 400, 404 |
| PATCH | `/members/:id` | body: sebagian field | 200 + member terbaru | 400, 404, 409 |
| DELETE | `/members/:id` | path `id` | 204 | 400, 404, 409 (masih punya membership / pendaftaran sesi) |

Contoh `POST /members`:

```json
{ "fullName": "Budi Santoso", "email": "budi@example.com", "phoneNumber": "081234567890", "dateOfBirth": "1999-05-20" }
```
Response `201`:
```json
{
  "id": 1, "fullName": "Budi Santoso", "email": "budi@example.com", "phoneNumber": "081234567890",
  "dateOfBirth": "1999-05-20", "address": null,
  "createdAt": "2026-11-10T11:10:21.597Z", "updatedAt": "2026-11-10T11:10:21.597Z"
}
```

---

## 3. Trainers

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| fullName | string | Ya | tidak kosong, maks 100 |
| email | string | Ya | email valid, huruf kecil, **unik** |
| phoneNumber | string | Ya | 8-15 digit, **unik** |
| specialization | string | Ya | tidak kosong, maks 100 |

| Method | Endpoint | Sukses | Error |
|---|---|---|---|
| POST | `/trainers` | 201 | 400, 409 |
| GET | `/trainers` | 200 | - |
| GET | `/trainers/:id` | 200 | 400, 404 |
| PATCH | `/trainers/:id` | 200 | 400, 404, 409 |
| DELETE | `/trainers/:id` | 204 | 400, 404, 409 (masih menangani sesi) |

---

## 4. Membership Plans

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| name | string | Ya | tidak kosong, maks 100, **unik** |
| description | string | Tidak | - |
| durationInDays | integer | Ya | 1 - 3650 |
| price | number | Ya | lebih dari 0, maks 2 desimal |

| Method | Endpoint | Sukses | Error |
|---|---|---|---|
| POST | `/membership-plans` | 201 | 400, 409 (nama duplikat) |
| GET | `/membership-plans` | 200 | - |
| GET | `/membership-plans/:id` | 200 | 400, 404 |
| PATCH | `/membership-plans/:id` | 200 | 400, 404, 409 |
| DELETE | `/membership-plans/:id` | 204 | 400, 404, 409 (sudah dipakai membership) |

Contoh `POST /membership-plans`:
```json
{ "name": "Paket Bulanan", "description": "Akses gym 30 hari", "durationInDays": 30, "price": 350000 }
```

---

## 5. Memberships

| Field (POST) | Tipe | Wajib | Aturan |
|---|---|---|---|
| memberId | integer | Ya | >= 1, member harus ada |
| membershipPlanId | integer | Ya | >= 1, plan harus ada |
| startDate | string | Ya | `YYYY-MM-DD` |

`endDate` **dihitung server**: `startDate + durationInDays - 1 hari` (paket 30 hari mulai 2026-11-10 berlaku sampai 2026-12-09).
`status` **dihitung saat dibaca**: `UPCOMING` (belum mulai), `ACTIVE` (sedang berlaku, termasuk hari pertama dan terakhir), `EXPIRED` (sudah berakhir).

| Method | Endpoint | Request | Sukses | Error |
|---|---|---|---|---|
| POST | `/memberships` | body: memberId, membershipPlanId, startDate | 201 | 400, 404 (member/plan tidak ada) |
| GET | `/memberships` | query opsional: `memberId`, `status` (`UPCOMING`/`ACTIVE`/`EXPIRED`) | 200 | 400 (query tidak valid) |
| GET | `/memberships/:id` | path `id` | 200 | 400, 404 |
| PATCH | `/memberships/:id` | body: `startDate?`, `membershipPlanId?` (`memberId` **tidak boleh** diubah -> 400) | 200 | 400, 404 |
| DELETE | `/memberships/:id` | path `id` | 204 | 400, 404 |

Response `201` `POST /memberships`:
```json
{
  "id": 1, "memberId": 1, "member": { "id": 1, "fullName": "Budi Santoso", "...": "..." },
  "membershipPlanId": 1, "membershipPlan": { "id": 1, "name": "Paket Bulanan", "price": 350000, "...": "..." },
  "startDate": "2026-11-10", "endDate": "2026-12-09",
  "createdAt": "2026-11-10T11:10:21.681Z", "updatedAt": "2026-11-10T11:10:21.681Z",
  "status": "ACTIVE"
}
```

---

## 6. Training Sessions

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| trainerId | integer | Ya | >= 1, trainer harus ada |
| title | string | Ya | tidak kosong, maks 100 |
| description | string | Tidak | - |
| startTime | string (ISO 8601) | Ya | tanggal-waktu valid |
| endTime | string (ISO 8601) | Ya | harus **setelah** `startTime` |
| capacity | integer | Ya | 1 - 500 |

| Method | Endpoint | Sukses | Error |
|---|---|---|---|
| POST | `/training-sessions` | 201 (termasuk objek `trainer`) | 400 (validasi / jadwal terbalik), 404 (trainer tidak ada) |
| GET | `/training-sessions` | 200 (diurutkan menurut `startTime`) | - |
| GET | `/training-sessions/:id` | 200 | 400, 404 |
| GET | `/training-sessions/:id/participants` | 200 + daftar peserta dan sisa kuota | 400, 404 |
| PATCH | `/training-sessions/:id` | 200 | 400, 404, 409 (`capacity` lebih kecil dari jumlah peserta saat ini) |
| DELETE | `/training-sessions/:id` | 204 | 400, 404, 409 (masih punya peserta) |

Contoh `POST /training-sessions`:
```json
{ "trainerId": 1, "title": "Morning Yoga", "startTime": "2026-11-20T08:00:00+07:00", "endTime": "2026-11-20T09:00:00+07:00", "capacity": 20 }
```

Response `GET /training-sessions/:id/participants`:
```json
{
  "sessionId": 4, "title": "Morning Yoga", "capacity": 1,
  "totalParticipants": 1, "availableSlots": 0,
  "participants": [
    { "id": 4, "memberId": 6, "member": { "id": 6, "fullName": "Budi Santoso", "...": "..." },
      "trainingSessionId": 4, "attendanceStatus": "REGISTERED", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

---

## 7. Session Participants (pendaftaran member ke sesi)

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| memberId | integer | Ya (POST) | >= 1 |
| trainingSessionId | integer | Ya (POST) | >= 1 |
| attendanceStatus | enum | Ya (PATCH) | `REGISTERED` (default saat daftar), `ATTENDED`, `ABSENT` |

| Method | Endpoint | Request | Sukses | Error |
|---|---|---|---|---|
| POST | `/session-participants` | body: memberId, trainingSessionId | 201 | 400, 404, 409 (lihat urutan di bawah) |
| GET | `/session-participants` | query opsional: `trainingSessionId`, `memberId` | 200 | 400 |
| GET | `/session-participants/:id` | path `id` | 200 | 400, 404 |
| PATCH | `/session-participants/:id` | body: `attendanceStatus` | 200 | 400, 404 |
| DELETE | `/session-participants/:id` | path `id` (membatalkan pendaftaran) | 204 | 400, 404 |

**Urutan pengecekan `POST /session-participants`:**

| # | Pengecekan | Gagal dengan |
|---|---|---|
| 1 | Member dan sesi harus ada | 404 |
| 2 | Member belum terdaftar di sesi yang sama | 409 |
| 3 | Sesi belum dimulai (`startTime` di masa depan) | 400 |
| 4 | Member punya membership aktif pada **tanggal sesi** (`startDate <= tanggal sesi <= endDate`) | 400 |
| 5 | Sesi belum penuh (jumlah peserta < `capacity`) | 409 |

Catatan: batas pengecekan 3 dan 4 memakai zona waktu server.

---

## 8. Matriks skenario pengujian

| Skenario | Contoh pada Postman Collection |
|---|---|
| Create data | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1 |
| Get all | 1.3, 2.2, 3.2, 4.4, 5.4, 6.13 |
| Get detail | 1.4, 2.3, 3.3, 4.7, 5.5, 6.15 |
| Update | 1.5, 2.4, 3.4, 4.8, 5.6, 6.16 |
| Delete | folder 8 |
| Validation error | 1.8, 1.9, 2.6, 3.6, 4.11-4.14, 5.7, 5.9, 6.12, 6.17 |
| Data tidak ditemukan | 1.10, 2.7, 3.7, 4.15, 5.10, 6.18, 8.15 |
| Duplicate data | 1.6, 1.7, 2.5, 3.5, 6.2 |
| Business rule violation | 6.3 (tanpa membership), 6.5 (sesi penuh), 6.8 (kapasitas), 6.9 (sesi lewat) |
| Relationship scenario | folder 7 (relasi dan delete ditolak oleh FK) |
