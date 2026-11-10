# ERD - Gym Management System

Gambar: [`erd.png`](./erd.png) (sumber: `erd.dot`, dibuat dengan Graphviz: `dot -Tpng -Gdpi=150 erd.dot -o erd.png`).

![ERD](./erd.png)

Versi Mermaid (otomatis tampil sebagai diagram di GitHub / VS Code dengan ekstensi Mermaid):

```mermaid
erDiagram
    MEMBERS ||--o{ MEMBERSHIPS : "memiliki"
    MEMBERSHIP_PLANS ||--o{ MEMBERSHIPS : "dipakai oleh"
    TRAINERS ||--o{ TRAINING_SESSIONS : "menangani"
    TRAINING_SESSIONS ||--o{ SESSION_PARTICIPANTS : "memiliki"
    MEMBERS ||--o{ SESSION_PARTICIPANTS : "mengikuti"

    MEMBERS {
        int id PK
        varchar full_name
        varchar email UK
        varchar phone_number UK
        date date_of_birth
        text address
    }
    TRAINERS {
        int id PK
        varchar full_name
        varchar email UK
        varchar phone_number UK
        varchar specialization
    }
    MEMBERSHIP_PLANS {
        int id PK
        varchar name UK
        text description
        int duration_in_days
        decimal price
    }
    MEMBERSHIPS {
        int id PK
        int member_id FK
        int membership_plan_id FK
        date start_date
        date end_date
    }
    TRAINING_SESSIONS {
        int id PK
        int trainer_id FK
        varchar title
        text description
        timestamptz start_time
        timestamptz end_time
        int capacity
    }
    SESSION_PARTICIPANTS {
        int id PK
        int member_id FK
        int training_session_id FK
        enum attendance_status
    }
```

Setiap tabel juga memiliki `created_at` dan `updated_at`.

## Catatan relasi

| Relasi | Kardinalitas | Foreign Key | Aturan hapus |
|---|---|---|---|
| members → memberships | 1 : N | `memberships.member_id` | RESTRICT |
| membership_plans → memberships | 1 : N | `memberships.membership_plan_id` | RESTRICT |
| trainers → training_sessions | 1 : N | `training_sessions.trainer_id` | RESTRICT |
| training_sessions → session_participants | 1 : N | `session_participants.training_session_id` | RESTRICT |
| members → session_participants | 1 : N | `session_participants.member_id` | RESTRICT |
| members ↔ training_sessions | N : M | lewat `session_participants` | - |

- `RESTRICT`: data induk tidak dapat dihapus selama masih dipakai data anak (API menjawab 409).
- `session_participants` memiliki unique constraint gabungan `(member_id, training_session_id)`: satu member hanya bisa terdaftar sekali pada satu sesi.
- Status membership (`UPCOMING`/`ACTIVE`/`EXPIRED`) **tidak** disimpan, tetapi dihitung dari `start_date` dan `end_date`.
