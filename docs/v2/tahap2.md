# Implementation Plan - Tahap 2: Backend Services, Middleware Permission, & API Endpoints Staf RS

Implementasi logika *Backend* untuk pengelolaan sub-akun staf Faskes, penentuan matrix hak akses (checklist permissions per role), middleware proteksi hak akses, serta penyempurnaan alur login untuk staf Faskes.

## User Review Required

> [!IMPORTANT]
> 1. **Hak Akses Admin RS (Pemilik Faskes)**:
>    Akun utama Faskes (role: `"rumah_sakit"`) otomatis mendapatkan semua *permissions* (Super Admin Faskes). Sub-akun staf (role: `"staf_rs"`) hanya memiliki *permissions* sesuai checklist pada Role yang ditentukan oleh Admin RS.
> 2. **Pendaftaran Akun Staf Baru**:
>    Admin RS dapat mendaftarkan akun staf secara langsung melalui dashboard RS (nama, email, password, role & jabatan). Status akun staf dibuat langsung `active`.

## Open Questions

- Tidak ada pertanyaan tertunda.

## Proposed Changes

### Backend (`be-satudata`)

---

#### [NEW] [permissionMiddleware.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/middleware/permissionMiddleware.js)
- Middleware `requirePermission(permissionCode)`:
  - Memeriksa apakah `req.user.role` adalah `"admin"` atau `"rumah_sakit"` (bebas akses).
  - Jika `"staf_rs"`, melakukan verifikasi apakah staf terdaftar aktif pada `hospital_staffs` dan memiliki permission yang dimaksud.
  - Jika tidak diizinkan, mengembalikan HTTP 403 (`"Anda tidak memiliki hak akses [permissionCode]"`).

#### [NEW] [hospitalStaffService.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/services/hospitalStaffService.js)
- `getAllPermissions()`: Mengambil seluruh master data permissions dikelompokkan berdasarkan kategori.
- `getHospitalRoles(hospitalId)`: Mengambil daftar role (default & custom RS) beserta list `permission_id`-nya.
- `createHospitalRole(hospitalId, data)`: Membuat role custom RS baru dengan pilihan checklist permissions.
- `updateHospitalRole(hospitalId, roleId, data)`: Memperbarui checklist permissions suatu role.
- `deleteHospitalRole(hospitalId, roleId)`: Menghapus role custom RS (apabila tidak digunakan oleh staf).
- `getHospitalStaffs(hospitalId)`: Mengambil daftar seluruh staf yang terdaftar di Faskes tersebut.
- `createHospitalStaff(hospitalId, data)`: Membuat akun User (`role: "staf_rs"`) dan profil `HospitalStaff`.
- `updateHospitalStaff(hospitalId, staffId, data)`: Memperbarui role/posisi/status staf.
- `deleteHospitalStaff(hospitalId, staffId)`: Me-nonaktifkan / menghapus akun staf.
- `getStaffPermissions(userId)`: Mengambil profil staf dan daftar kode permission aktif pengunggah.

#### [NEW] [hospitalStaffController.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/controllers/hospitalStaffController.js)
- Handler HTTP request untuk seluruh endpoint manajemen staf dan role RS di atas.

#### [MODIFY] [hospitalRoutes.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/routes/hospitalRoutes.js)
- Mendaftarkan endpoint API staf dan role ke `/api/hospital`:
  - `GET /api/hospital/permissions` -> Get all master permissions
  - `GET /api/hospital/roles` -> Get hospital roles + permission checklist
  - `POST /api/hospital/roles` -> Create custom role
  - `PUT /api/hospital/roles/:id` -> Update role permissions checklist
  - `DELETE /api/hospital/roles/:id` -> Delete custom role
  - `GET /api/hospital/staffs` -> Get all staff members
  - `POST /api/hospital/staffs` -> Add new staff account
  - `PUT /api/hospital/staffs/:id` -> Update staff member
  - `DELETE /api/hospital/staffs/:id` -> Delete staff member
  - `GET /api/hospital/my-permissions` -> Get logged in staff permissions

#### [MODIFY] [authService.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/services/authService.js)
- Menyesuaikan `loginUser` agar jika user memiliki `role: "staf_rs"`, data respons login juga menyertakan `staffProfile`, nama RS, nama role, serta daftar kode permissions yang berhak diakses.

---

## Verification Plan

### Automated Tests
- Menjalankan `node -c` untuk semua file backend baru untuk memastikan sintaks JS valid.

### Manual Verification
- Pengujian API via cURL / HTTP client:
  1. Login sebagai Admin RS.
  2. Panggil `GET /api/hospital/permissions` dan `GET /api/hospital/roles`.
  3. Panggil `POST /api/hospital/staffs` untuk menambahkan akun staf baru (misal: Staf Apoteker).
  4. Panggil `POST /api/auth/login` dengan akun staf baru.
  5. Pastikan token & daftar permissions staf berhasil didapatkan.
