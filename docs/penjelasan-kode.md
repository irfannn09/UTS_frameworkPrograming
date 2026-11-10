# Panduan Memahami Kode (untuk Presentasi)

Dokumen ini membantu setiap anggota kelompok menjelaskan source code sendiri. Baca berurutan, lalu coba telusuri file aslinya.

## 1. Alur satu request (inti yang harus dipahami)

```
Postman
  → Controller            (menerima HTTP request, membaca path/body/query)
  → ValidationPipe + DTO  (memvalidasi input SEBELUM controller dijalankan)
  → Service               (business logic: cek aturan, panggil repository)
  → Repository (TypeORM)  (membuat query SQL)
  → PostgreSQL            (menyimpan/mengambil data)
  → Service → Controller  (hasil dikembalikan)
  → Response JSON + status code
```

Jika ada error: `Service` melempar exception (`NotFoundException`, `ConflictException`, `BadRequestException`), dan NestJS otomatis mengubahnya menjadi response dengan status code yang sesuai. Error langsung dari database (duplikat / foreign key) ditangkap `TypeOrmExceptionFilter`.

### Contoh nyata: `POST /session-participants` (mendaftarkan member ke sesi)

1. Postman mengirim `{ "memberId": 1, "trainingSessionId": 2 }`.
2. `ValidationPipe` (diatur di `main.ts`) mengubah JSON menjadi `CreateSessionParticipantDto` dan memeriksa `@IsInt()`, `@Min(1)`. Gagal → langsung **400**, controller tidak dijalankan.
3. `SessionParticipantsController.create()` hanya meneruskan DTO ke service.
4. `SessionParticipantsService.create()` menjalankan pengecekan berurutan: member ada? sesi ada? sudah terdaftar? sesi sudah dimulai? member punya membership aktif? sesi penuh? Setiap pelanggaran melempar exception (404 / 409 / 400).
5. Jika lolos semua, `participantsRepository.save()` menjalankan `INSERT INTO session_participants ...`.
6. Service mengambil ulang data lengkap (beserta member dan sesi) dan mengembalikannya → **201 Created**.

## 2. Peran setiap jenis file

| File | Fungsi | Mengapa dipisah |
|---|---|---|
| `*.entity.ts` | Mendefinisikan **tabel** dan relasi (`@Entity`, `@Column`, `@ManyToOne`, `@OneToMany`) | TypeORM membuat tabel dari class ini |
| `dto/*.dto.ts` | Mendefinisikan **bentuk dan aturan input** (`@IsEmail`, `@IsInt`, ...) | Input dari client tidak dipercaya, harus divalidasi |
| `*.controller.ts` | Mendefinisikan **route** (`@Get`, `@Post`, ...) dan status code | Hanya urusan HTTP, tanpa logika bisnis |
| `*.service.ts` | **Business logic** dan akses database | Logika terkumpul satu tempat, mudah diuji |
| `*.module.ts` | Mengelompokkan controller, service, dan repository satu fitur | Dependency Injection NestJS bekerja per module |
| `app.module.ts` | Menyatukan semua module + koneksi database | Titik awal aplikasi |
| `main.ts` | Menyalakan aplikasi, mendaftarkan `ValidationPipe` dan filter global | Konfigurasi global |

## 3. Konsep kunci

**Dependency Injection.** Service tidak membuat repository sendiri. Ia memintanya lewat constructor:
`constructor(@InjectRepository(Member) private membersRepository: Repository<Member>)`. NestJS yang menyediakannya, karena `Member` didaftarkan di `TypeOrmModule.forFeature([...])` pada module.

**Repository.** Objek TypeORM untuk satu entity: `find`, `findOne`, `save`, `remove`, `count`, `exists`. Kita tidak menulis SQL manual.

**DTO + class-validator + class-transformer.**
- class-validator = *aturan* (`@IsEmail()`, `@Min(1)`, `@IsNotEmpty()`).
- class-transformer = *perubahan nilai* sebelum validasi: `@Type(() => Date)` mengubah teks menjadi Date, `@Type(() => Number)` mengubah query string menjadi angka, `@Transform` (dipakai untuk email: trim + huruf kecil, dan `@Trim()`).
- `ValidationPipe({ transform: true })` yang menjalankan keduanya.
- `whitelist` + `forbidNonWhitelisted`: field di luar DTO ditolak (400).

**`PartialType`** (`@nestjs/mapped-types`). `UpdateMemberDto extends PartialType(CreateMemberDto)` = semua field jadi opsional (cocok untuk PATCH) tanpa menulis ulang aturan validasi. `OmitType` dipakai di `UpdateMembershipDto` untuk membuang `memberId`.

**Primary Key & Foreign Key.**
- PK: `@PrimaryGeneratedColumn()` (integer auto increment).
- FK: kolom `memberId` + `@ManyToOne(() => Member, ..., { onDelete: 'RESTRICT' })` + `@JoinColumn({ name: 'member_id' })`.
- Sisi sebaliknya: `@OneToMany(() => Membership, m => m.member)` pada `Member`.

**Relasi many-to-many Member ↔ TrainingSession.** Diwujudkan oleh entity `SessionParticipant` yang punya dua `@ManyToOne`. Dipilih daripada `@ManyToMany` karena tabel penghubungnya punya kolom sendiri (`attendanceStatus`) dan endpoint sendiri.

**`onDelete: 'RESTRICT'`.** Data induk tidak bisa dihapus selama masih dipakai. PostgreSQL menolak, `TypeOrmExceptionFilter` mengubahnya menjadi **409 Conflict** (Business Rule #11).

**Status membership dihitung, bukan disimpan** (`memberships/membership-status.ts`). Membandingkan `startDate`/`endDate` dengan tanggal hari ini. Keuntungannya: tidak pernah "basi" dan tidak butuh scheduler.

**`synchronize: true`** (di `app.module.ts`): tabel dibuat/disesuaikan otomatis dari entity saat aplikasi menyala. Praktis untuk development. Di production dipakai *migration*.

## 4. Business rule → lokasi kode

| # | Aturan | Di mana |
|---|---|---|
| 1 | Member tidak boleh duplikat | `members.service.ts` → `ensureUnique()` + `unique: true` di entity (jaring pengaman DB) |
| 2 | Membership punya tanggal mulai & berakhir | `membership.entity.ts` (kolom wajib) + `calculateEndDate()` di `memberships.service.ts` |
| 3 | Status dari masa berlaku | `membership-status.ts` |
| 4 | Membership mengacu ke Member & Plan | FK di entity + `ensureMemberExists()` / `findPlan()` (404) |
| 5 | Session wajib punya Trainer | `trainerId` NOT NULL + `ensureTrainerExists()` |
| 6 | Session wajib punya jadwal | DTO `@IsDate()` + `validateTimeRange()` |
| 7 | Session punya kapasitas | `capacity` di DTO (`@Min(1)`, `@Max(500)`) |
| 8 | Tidak boleh daftar dua kali | `session-participants.service.ts` (`exists`) + `@Unique` di entity |
| 9 | Tidak boleh daftar jika penuh | `session-participants.service.ts` (`count >= capacity`) |
| 10 | Participant menghubungkan Member & Session | dua FK di `session-participant.entity.ts` |
| 11 | Hapus mempertimbangkan FK | `onDelete: 'RESTRICT'` + `typeorm-exception.filter.ts` |
| 12 | Status code sesuai | exception NestJS di service, `@HttpCode(204)` di controller |
| R13 | Perlu membership aktif untuk daftar sesi | `session-participants.service.ts` |
| R14 | Tidak boleh daftar sesi yang sudah dimulai | `session-participants.service.ts` |
| R15 | Kapasitas tidak boleh di bawah jumlah peserta | `training-sessions.service.ts` → `update()` |

## 5. Pertanyaan yang mungkin ditanyakan dosen

1. **Apa beda Controller dan Service?** Controller mengurus HTTP (route, parameter, status code). Service berisi logika bisnis dan akses database.
2. **Mengapa perlu DTO?** Agar input dari client divalidasi dan dibatasi bentuknya sebelum masuk ke logika; entity mewakili tabel, DTO mewakili kontrak API.
3. **Apa yang dilakukan `ValidationPipe`?** Mengubah body menjadi instance DTO (class-transformer) dan menjalankan dekorator class-validator; gagal → 400 otomatis.
4. **Apa itu Dependency Injection?** NestJS membuatkan dan menyuntikkan objek yang dibutuhkan (misalnya Repository) lewat constructor, bukan dibuat manual dengan `new`.
5. **Bagaimana relasi one-to-many ditulis di TypeORM?** `@OneToMany` di sisi induk, `@ManyToOne` + `@JoinColumn` di sisi anak (sisi yang memegang FK).
6. **Mengapa session-participants tidak memakai `@ManyToMany`?** Tabel penghubungnya punya atribut sendiri (`attendanceStatus`) dan endpoint sendiri.
7. **Apa yang terjadi jika menghapus member yang punya membership?** Database menolak karena FK `RESTRICT`; filter mengubahnya menjadi 409.
8. **Mengapa status membership tidak disimpan?** Status bergantung pada tanggal hari ini; jika disimpan, harus terus diperbarui. Dihitung saat dibaca selalu benar.
9. **Mengapa 404 untuk `memberId` tidak ada di body, bukan 400?** Format body benar, tetapi data yang dirujuk tidak ditemukan.
10. **Mengapa 409 untuk sesi penuh?** Permintaan valid, tetapi bertabrakan dengan kondisi data saat ini (kapasitas sudah terpakai).
11. **Apa fungsi `synchronize: true` dan risikonya?** Membuat/menyesuaikan tabel otomatis dari entity; di production berisiko mengubah/menghapus kolom, sehingga dipakai migration.
12. **Bagaimana mencegah email duplikat?** Dua lapis: pengecekan di service (pesan error jelas) dan `unique: true` di database (jaring pengaman jika dua request datang bersamaan).

## 6. Urutan demo yang disarankan

1. `docker compose up -d`, `npm run start:dev`.
2. Tunjukkan tabel di database (`docker exec -it gym_postgres psql -U gym_user -d gym_db -c "\dt"`).
3. Jalankan folder 1 (Members) di Postman, lalu tunjukkan satu error 400 dan satu 409.
4. Jalankan folder 6: tunjukkan daftar sesi, daftar dua kali (409), sesi penuh (409), tanpa membership (400).
5. Tunjukkan folder 7: hapus data yang masih dipakai ditolak (409), lalu folder 8: hapus berhasil (204).
