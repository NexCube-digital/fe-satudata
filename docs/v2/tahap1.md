# Implementation Plan - Tahap 1: Skema Database & Relasi Model RBAC Sub-Akun Faskes

Implementasi struktur database dan model Sequelize untuk mendukung pembagian sub-akun staf di Faskes/Rumah Sakit (Admin RS, Informasi/Pendaftaran, Rekam Medis, Apoteker/POS) dengan sistem *Role-Based Access Control* (RBAC) berbasis checklist *permissions*.

## User Review Required

> [!IMPORTANT]
> 1. **Perubahan ENUM `role` pada Tabel `users`**:
>    Kita akan menambahkan nilai `"staf_rs"` ke kolom `role` pada model `users`.
> 2. **Master Permissions**:
>    Sistem akan menyertakan *seeder* awal untuk master modul/fitur hak akses agar Admin RS dapat langsung memilih checklist fitur per role.

## Open Questions

- Tidak ada pertanyaan tertunda saat ini. Rincian skema sudah mencakup kebutuhan 4 role utama (Admin RS, Informasi, Rekam Medis, Apoteker).

## Proposed Changes

### Backend (`be-satudata`)

---

#### [MODIFY] [userModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/userModels.js)
- Menambahkan `"staf_rs"` ke dalam ENUM `role` pada tabel `users`.

#### [NEW] [permissionModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/permissionModels.js)
- Tabel `permissions`: menyimpan daftar master fitur/izin (contoh: `patient:create`, `access_request:create`, `medical_record:upload`, `pharmacy:manage`, `staff:manage`).

#### [NEW] [hospitalroleModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/hospitalroleModels.js)
- Tabel `hospital_roles`: menyimpan daftar role (contoh: Admin RS, Informasi/Pendaftaran, Rekam Medis, Apoteker/POS) yang terikat ke `hospital_id` tertentu (atau role bawaan sistem).

#### [NEW] [hospitalrolepermissionModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/hospitalrolepermissionModels.js)
- Tabel `hospital_role_permissions`: tabel pivot/relasi checklist antara `hospital_role_id` dan `permission_id`.

#### [NEW] [hospitalstaffModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/hospitalstaffModels.js)
- Tabel `hospital_staffs`: menghubungkan `user_id` (sub-akun staf) ke `hospital_id` dan `hospital_role_id`.

#### [MODIFY] [relasiModels.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/models/relasiModels.js)
- Mendefinisikan relasi Sequelize:
  - `HospitalProfile` hasMany `HospitalRole`
  - `HospitalRole` belongsToMany `Permission` (melalui `HospitalRolePermission`)
  - `Permission` belongsToMany `HospitalRole` (melalui `HospitalRolePermission`)
  - `User` hasOne `HospitalStaff`
  - `HospitalStaff` belongsTo `User`, `HospitalProfile`, dan `HospitalRole`
  - Export semua model baru.

#### [NEW] [permissionSeeder.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/seeders/master/permissionSeeder.js)
- Seeder otomatis untuk meng-populate master data permissions dan default roles ke database.

---

## Verification Plan

### Automated Tests
- Menjalankan script sync/test Sequelize di `be-satudata` untuk memastikan tabel-tabel baru terbuat di database tanpa error relasi foreign key.

### Manual Verification
- Memeriksa struktur tabel `permissions`, `hospital_roles`, `hospital_role_permissions`, dan `hospital_staffs` di MariaDB/MySQL phpMyAdmin.
- Memastikan seeder berhasil mengisi data permission awal.
