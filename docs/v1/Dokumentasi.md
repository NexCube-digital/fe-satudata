# Walkthrough - Hasil Integrasi API Frontend & Backend SatuData

Integrasi penuh antara **Frontend Next.js (`fe-satudata`)** dan **Backend Express REST API (`be-satudata`)** berdasarkan [documentasiApi.md](file:///c:/Xampp/htdocs/SatuData/be-satudata/docs/sistem/documentasiApi.md) telah selesai dikerjakan.

---

## 🛠️ Komponen & Layanan Yang Dibuat:

### 1. API Client Layer ([src/lib/api.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/api.js))
- **Terpusat & Otomatis**: Menyisipkan header `Authorization: Bearer <accessToken>` pada setiap HTTP request.
- **Auto-Refresh Token Interceptor**: Mengambil token baru via `/api/auth/refresh` secara otomatis saat menerima error `401 Unauthorized` dan mengulang request tanpa mengganggu pengguna.
- **Manajemen Sesi Storage**: Helper `setTokens`, `getAccessToken`, `getUser`, `setUser`, dan `clearAuth`.

### 2. Integrasi Alur Autentikasi (`/api/auth/*`)
- **Login ([src/app/auth/login/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/auth/login/page.js))**:
  - Mengirim `{ identifier, password }` (mendukung Email atau NIK 16 digit).
  - Penanganan status `403 Inactive Account` dengan opsi **Kirim Ulang Email Aktivasi** (`POST /api/auth/resend-activation`).
  - Pengalihan role dinamis (`pasien`, `rumah_sakit` / `faskes`, `admin`).
- **Registrasi Dinamis ([src/app/auth/register/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/auth/register/page.js))**:
  - Mendukung payload terpisah untuk **Pasien** (`nik`, `place_of_birth`, `date_of_birth`, `sex`, `blood_type`, `emergency_contact_*`) dan **Rumah Sakit** (`medical_license`, `hospital_type`, `ownership`, `accreditation`, `website`, `description`).
- **Aktivasi Akun via Email ([src/app/auth/activate/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/auth/activate/page.js))**:
  - Memuat token URL params `?token=...` dan memanggil `GET /api/auth/activate`.
- **Alur Password**:
  - **Lupa Password ([src/app/auth/forgot-password/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/auth/forgot-password/page.js))**: `POST /api/auth/forgot-password`.
  - **Reset Password ([src/app/auth/reset-password/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/auth/reset-password/page.js))**: `POST /api/auth/reset-password`.

### 3. Penautan Web3 Wallet MetaMask ([src/lib/wallet.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/wallet.js))
- Menangani 3-step Web3 Signature Binding:
  1. `POST /api/auth/wallet/nonce` -> Menerima nonce & pesan unik dari backend.
  2. `personal_sign` -> Meminta tanda tangan digital gratis via MetaMask.
  3. `POST /api/auth/wallet/connect` -> Verifikasi signature di smart contract & backend.

### 4. Layanan API Dashboard:
- **Patient Service ([src/lib/patientService.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/patientService.js))**: Access profile (`/api/patient/profile`), EHR history (`/api/patient/history`), dan Audit logs (`/api/patient/audit`).
- **Hospital Service ([src/lib/hospitalService.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/hospitalService.js))**: Access profile (`/api/hospital/profile`), Request EHR Pasien (`/api/hospital/patient/:id`), dan Audit logs (`/api/hospital/audit`).
- **Doctor Service ([src/lib/doctorService.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/lib/doctorService.js))**: CRUD Dokter Faskes (`/api/patient/doctor`).

---

## 🔍 Cara Pengujian:

1. **Registrasi Akun Baru**:
   Buka `http://localhost:5173/auth/register`, pilih tab *Pasien Baru* atau *Fasilitas Kesehatan*, lalu daftar akun.
2. **Aktivasi Email**:
   Gunakan token aktivasi dari email (atau simulasi URL `http://localhost:5173/auth/activate?token=...`).
3. **Login Akun**:
   Buka `http://localhost:5173/auth/login`, masukkan email/NIK & password untuk masuk ke dashboard.
4. **Penautan MetaMask Wallet**:
   Pada dashboard/settings, jalankan alur tautkan dompet MetaMask.
