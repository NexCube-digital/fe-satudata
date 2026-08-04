# Panduan Penggunaan Sistem Sub-Akun & Matrix Hak Akses (RBAC) Faskes

Dokumen ini menjelaskan alur operasional penggunaan sistem pemecahan akun Fasilitas Kesehatan / Rumah Sakit menjadi beberapa sub-akun staf (*Role-Based Access Control* / RBAC) pada platform **Satu Data**.

---

## 📌 1. Konsep & Struktur Sub-Akun Faskes

Akun Fasilitas Kesehatan tidak lagi dipakai bersama-sama oleh semua karyawan. Setiap staf memiliki **email & password sendiri**, terhubung ke Faskes tempatnya bekerja, dan wewenangnya diatur melalui **Matrix Hak Akses (Checklist Fitur)**.

### Perincian 4 Role Default & Pembagian Tugas

| Role Sub-Akun | Deskripsi & Tugas Utama | Fitur / Modul yang Dapat Dicentang |
| :--- | :--- | :--- |
| **Admin RS** | Super Admin internal RS untuk manajemen staf, role, dan profil Faskes. | - `staff:manage` (Kelola Staf RS)<br>- `role:manage` (Matrix Hak Akses Role)<br>- *Seluruh modul Faskes* |
| **Informasi / Pendaftaran** | Petugas Front Desk untuk mendaftarkan pasien dan mengelola izin akses rekam medis. | - `patient:create` (Registrasi Akun Pasien Baru)<br>- `access_request:create` (Minta Akses Data Pasien)<br>- `access_request:read` (Lihat Status Request) |
| **Rekam Medis** | Petugas penginputan dan verifikasi berkas rekam medis pasien. | - `medical_record:upload` (Upload Rekam Medis Baru)<br>- `medical_record:read` (Lihat Riwayat Rekam Medis) |
| **Apoteker / POS Obat** | Petugas farmasi dan kasir pengeluaran resep obat. | - `pharmacy:manage` (Kelola Resep & Katalog Obat)<br>- `pharmacy:pos` (Transaksi Kasir Obat) |

---

## 🛠️ 2. Panduan Operasional Admin RS (Pemilik Faskes)

### A. Mengatur Checklist Fitur per Role (Matrix Hak Akses)
1. Login sebagai **Admin RS** (`rumah_sakit`).
2. Pilih menu **Kelola Staf & Hak Akses** pada sidebar navigasi.
3. Klik pada tab **Matrix Hak Akses (Checklist Fitur)**.
4. Pilih Role yang ingin dikonfigurasi di kolom kiri (contoh: *Apoteker / POS*).
5. Pada panel sebelah kanan, centang atau hilangkan centang fitur/modul sesuai wewenang kerja staf.
6. Klik tombol **Simpan Hak Akses Role**. Perubahan akan berlaku secara instan.

### B. Membuat Custom Role Baru
1. Di tab **Matrix Hak Akses**, klik tombol **+ Custom Role**.
2. Masukkan Nama Role (contoh: *Petugas Laboratorium Khusus*) dan Deskripsi.
3. Setelah dibuat, tentukan checklist fiturnya lalu klik **Simpan Hak Akses Role**.

### C. Mendaftarkan Akun Staf Baru
1. Klik pada tab **Daftar Staf Faskes**.
2. Klik tombol **+ Tambah Staf Baru**.
3. Isi **Nama Lengkap**, **Email**, **Password Awal**, pilih **Role Akses**, dan **Jabatan**.
4. Klik **Simpan Staf**. Akun staf baru otomatis aktif dan dapat langsung digunakan untuk login.

---

## 🔑 3. Panduan untuk Staf Faskes

1. Buka halaman Login Satu Data dan masukkan **Email Staf** serta **Password** yang diberikan oleh Admin RS.
2. Setelah login, sistem akan membaca daftar wewenang (permissions) yang diberikan.
3. **Sidebar Navigasi** secara otomatis hanya akan menampilkan modul/menu yang telah dicentang oleh Admin RS.
4. Setiap transaksi yang dilakukan (penginputan rekam medis, pendaftaran pasien, dll.) akan mencatat identitas nama dan role staf pada **Audit Trail System**.

---

## 🛡️ 4. Keamanan & Audit Trail

- **Privilege Separation**: Staf Pendaftaran tidak bisa melihat/mengunggah rekam medis jika tidak diberi centang `medical_record:upload`.
- **Audit Logging**: Setiap aksi pengubahan wewenang role maupun pendaftaran staf oleh Admin RS secara otomatis dicatat dalam tabel `audit_logs` demi transparansi dan kepatuhan standar hukum kesehatan.
