# Implementation Plan - Tahap 3: Frontend UI Manajemen Staf & Matrix Hak Akses (RBAC)

Implementasi antarmuka pengguna (UI/UX) pada *Frontend* (`fe-satudata`) untuk pengelolaan sub-akun staf RS, pengeditan checklist hak akses (matrix permissions) secara interaktif, serta filtering menu navigasi sidebar secara dinamis berbasis role.

## User Review Required

> [!IMPORTANT]
> 1. **Antarmuka Checklist Matrix Hak Akses**:
>    Halaman Manajemen Staf & Role akan menyediakan antarmuka checklist interaktif (Matrix Hak Akses) per modul/fitur, sehingga Admin RS dapat mencentang atau meng-uncheck akses fitur untuk setiap role secara real-time.
> 2. **Sidebar Dinamis untuk Sub-Akun Staf**:
>    Saat staf RS login, sidebar hanya akan menampilkan modul/menu yang telah dicentang oleh Admin RS.

## Open Questions

- Tidak ada pertanyaan tertunda.

## Proposed Changes

### Frontend (`fe-satudata`)

---

#### [NEW] [page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/staffs/page.js)
- Halaman **Manajemen Staf & Hak Akses Faskes** yang terdiri dari 2 Tab Utama:
  - **Tab 1 (Daftar Staf Faskes)**:
    - Tabel data staf (Nama, Email, Jabatan, Role Akses, Status).
    - Modal / Form **Tambah Staf Baru** (Nama, Email, Password, Role, Jabatan).
    - Fitur Edit Role, Ganti Status (Aktif/Nonaktif), dan Reset Password Staf.
  - **Tab 2 (Matrix Hak Akses & Checklist Permission)**:
    - Pilihan Role yang ingin dikonfigurasi (Admin RS, Informasi, Rekam Medis, Apoteker, atau Role Custom).
    - Modal / Form **Tambah Role Custom Baru**.
    - **Matrix Checklist Fitur**: Tabel checklist interaktif yang mengelompokkan permission berdasarkan kategori (Pendaftaran, Rekam Medis, Farmasi/POS, Admin RS).
    - Tombol **Simpan Hak Akses** untuk memperbarui permission role ke API backend (`PUT /api/hospital/roles/:id`).

#### [MODIFY] [Sidebar.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/layout/Sidebar.js)
- Mendukung role `"staf_rs"` bersama `"rumah_sakit"`.
- Menambahkan menu **Kelola Staf & Hak Akses** (`/dashboard/faskes/staffs`) untuk Admin RS / Staf dengan permission `staff:manage` atau `role:manage`.
- Melakukan filtering menu navigasi secara otomatis sesuai permission yang dikembalikan backend untuk `staf_rs`.

#### [MODIFY] [Navbar.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/layout/Navbar.js)
- Menampilkan badge nama role staf (misal: `"Petugas Rekam Medis"`) dan nama Faskes pada profil user di bagian header/navbar.

---

## Verification Plan

### Automated Tests
- Menjalankan build check `npm run build` atau tes sintaks Next.js/React pada `fe-satudata` untuk memastikan tidak ada error kompilasi JSX/React hooks.

### Manual Verification
- **Pengujian UI di Browser**:
  1. Login sebagai Admin RS (`rumah_sakit`).
  2. Buka menu **Kelola Staf & Hak Akses**.
  3. Buka Tab **Matrix Hak Akses**, centang/hilangkan centang beberapa fitur untuk role **Apoteker**, lalu simpan.
  4. Buka Tab **Daftar Staf**, tambahkan staf baru dengan role **Apoteker**.
  5. Logout dari Admin RS, lalu login menggunakan akun staf Apoteker yang baru dibuat.
  6. Verifikasi bahwa sidebar staf Apoteker hanya menampilkan menu sesuai checklist yang diatur Admin RS.
