# Rencana Implementasi - Halaman Dashboard Faskes (/dashboard/faskes/*)

Menambahkan sub-halaman dashboard Faskes/Rumah Sakit `/dashboard/faskes/patients` (Data Pasien) dan `/dashboard/faskes/requests` (Permintaan Akses) di frontend Next.js (`fe-satudata`), menyelaraskannya dengan backend API (`be-satudata`), dan memperbaiki kesalahan routing serta parameter pada `doctorService.js`.

---

## User Review Required

> [!IMPORTANT]
> - Semua perubahan menggunakan Tailwind CSS v4 sesuai konfigurasi proyek yang ada untuk menjamin estetika visual premium yang seragam.
> - Halaman `/dashboard/faskes/patients` akan mengintegrasikan pengajuan rekam medis baru (EHR) dan visualisasi EHR pasien yang terdekripsi secara aman.
> - Kami mengidentifikasi mismatch di `doctorService.js` (frontend menggunakan `/api/patient/doctor` sedangkan backend adalah `/api/doctor`), serta kesalahan penulisan ID parameter untuk update/delete yang akan kita perbaiki sebagai bagian dari kalibrasi backend.

---

## Open Questions

*Tidak ada pertanyaan terbuka saat ini. Rencana di bawah mencakup semua perbaikan yang diperlukan untuk integrasi penuh.*

---

## Proposed Changes

### Frontend Service Layer

#### [MODIFY] [doctorService.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/doctorService.js)
- Mengubah endpoint `/api/patient/doctor` menjadi `/api/doctor` agar sesuai dengan routing backend di `be-satudata/src/app.js`.
- Memperbaiki fungsi `updateDoctor` dan `deleteDoctor` agar menyertakan ID dokter di URL parameter (misal: `/api/doctor/:id`), karena backend mengharapkan parameter tersebut di route path.

---

### Frontend Pages

#### [NEW] [page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/patients/page.js)
Membuat halaman **Data Pasien** (`/dashboard/faskes/patients`):
- Memvalidasi sesi login pengguna dengan role faskes (`rumah_sakit` atau `faskes`).
- Menampilkan daftar pasien yang status permintaannya disetujui (`Approved`) dari endpoint `/api/hospital/access-requests`.
- Menyediakan pencarian pasien berdasarkan nama atau alamat dompet (wallet address).
- Menyediakan tombol **Buka EHR** yang akan memicu dekripsi rekam medis pasien dengan parameter signature via `GET /api/hospital/patient/:id?signature=...`.
- Menyediakan modal/form **Tambah Rekam Medis Baru** (`POST /api/hospital/medical-record`) dengan field dinamis berdasarkan tipe rekam medis (`umum`, `lab`, `radiologi`, `resep`).
- Menghubungkan pilihan dokter penanggung jawab dari database melalui endpoint `GET /api/doctor` (menggunakan `doctorService`).

#### [NEW] [page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/requests/page.js)
Membuat halaman **Permintaan Akses** (`/dashboard/faskes/requests`):
- Memvalidasi sesi login pengguna.
- Menampilkan daftar histori pengajuan izin akses (baik yang berstatus *Pending*, *Approved*, *Rejected*, maupun *Revoked*) dari `/api/hospital/access-requests`.
- Menyediakan form **Ajukan Izin Akses Baru** (`POST /api/hospital/access-requests`) dengan input alamat dompet pasien, unit/poli dokter, dan tujuan pemeriksaan.
- Menyediakan filter status permohonan.

---

## Verification Plan

### Automated Tests
- Menjalankan `npm run dev` pada frontend dan backend untuk memastikan tidak ada error kompilasi.

### Manual Verification
1. Login sebagai akun faskes (`rs@example.com` / `password`).
2. Masuk ke halaman **Data Pasien** (`/dashboard/faskes/patients`):
   - Pastikan daftar pasien berstatus "Approved" tampil.
   - Buka EHR salah satu pasien dan periksa dekripsi datanya.
   - Tambahkan rekam medis baru, pilih dokter, isi form detail, isi signature, lalu simpan. Pastikan tersimpan dengan benar dan muncul di riwayat.
3. Masuk ke halaman **Request Akses** (`/dashboard/faskes/requests`):
   - Periksa daftar permintaan akses.
   - Kirim permintaan akses baru ke alamat dompet pasien (`0x1111111111111111111111111111111111111111`). Pastikan statusnya "Pending Pasien" dan bertambah di tabel.
