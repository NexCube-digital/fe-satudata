# Struktur Folder Project FE_SatuData

Dokumen ini berisi hasil analisis struktur folder dari workspace frontend `fe-satudata`. Fokusnya adalah memetakan area utama project, halaman apa saja yang tersedia, dan folder mana yang bertanggung jawab untuk UI, service, serta aset statis.

## Ringkasan Arsitektur

Project ini memakai Next.js App Router dengan pemisahan yang cukup jelas:
- `src/app` untuk routing dan halaman
- `src/components` untuk komponen UI dan komponen fitur
- `src/services` untuk akses API backend
- `src/lib` untuk helper umum seperti API client dan blockchain
- `public` untuk aset statis
- `docs` untuk dokumentasi internal dan versi kebutuhan

## Struktur Root

```text
fe-satudata/
|-- eslint.config.mjs
|-- jsconfig.json
|-- next.config.mjs
|-- package.json
|-- postcss.config.mjs
|-- struktur.md
|-- docs/
|-- public/
|-- src/
```

### Keterangan Root

- `package.json`: daftar dependency dan script project.
- `next.config.mjs`: konfigurasi Next.js.
- `eslint.config.mjs`: aturan linting.
- `postcss.config.mjs`: konfigurasi pemrosesan CSS.
- `jsconfig.json`: alias import dan konfigurasi path.
- `struktur.md`: dokumen struktur folder ini.

## Folder `docs`

```text
docs/
|-- v1/
|   |-- AGENTS.md
|   |-- arsitektur.md
|   |-- CLAUDE.md
|   |-- Dokumentasi.md
|   |-- Faskes.md
|   |-- modul.md
|   |-- PRD.md
|   |-- README.md
|-- v2/
	|-- RBAC_USER_MANUAL.md
	|-- tahap1.md
	|-- tahap2.md
	|-- tahap3.md
	|-- tahap4.md
```

### Keterangan `docs`

- `docs/v1`: dokumentasi awal, arsitektur, kebutuhan, dan modul fitur.
- `docs/v2`: dokumentasi lanjutan, termasuk panduan RBAC dan tahapan pengembangan.

## Folder `public`

```text
public/
|-- images/
|   |-- kemenkes.jfif
|   |-- satusehat.jfif
|   |-- logo.png
|   |-- logo1.png
|   |-- login.jpg
|-- file.svg
|-- globe.svg
|-- next.svg
|-- vercel.svg
|-- window.svg
```

### Keterangan `public`

- Menyimpan aset statis yang dipakai langsung oleh UI.
- Folder `images` berisi logo, ilustrasi, dan gambar pendukung halaman login atau branding.

## Folder `src`

```text
src/
|-- app/
|-- components/
|-- config/
|-- lib/
|-- services/
```

### 1. `src/app`

Folder ini adalah pusat routing aplikasi. Hampir semua halaman user, admin, dan faskes diletakkan di sini.

```text
src/app/
|-- globals.css
|-- layout.js
|-- page.js
|-- not-found.js
|-- activate/
|-- auth/
|-- consent/
|-- dashboard/
|-- faq/
|-- faskes/
|-- logs/
|-- records/
|-- reset-password/
|-- settings/
|-- users/
```

#### Subfolder penting di `src/app`

- `auth`: halaman autentikasi seperti login, register, forgot password, reset password, dan activate.
- `dashboard/admin`: dashboard admin, termasuk pengelolaan user, faskes, logs, dan settings.
- `dashboard/faskes`: dashboard fasilitas kesehatan, termasuk doctor, patients, pharmacy, audit, requests, settings, geotagging, dan medical records.
- `dashboard/pasien`: dashboard pasien untuk consent, records, settings, dan halaman utama.
- `consent`, `records`, `settings`, `users`, `logs`, `faq`, `faskes`: halaman publik atau halaman akses cepat yang tidak masuk dashboard utama.

#### Struktur khusus `dashboard/faskes`

```text
src/app/dashboard/faskes/
|-- audit/
|-- doctor/
|   |-- add/
|   |-- list/
|-- geotagging/
|-- medical-records/
|   |-- upload/
|-- patients/
|   |-- [id]/
|-- pharmacy/
|   |-- inventory/
|   |-- pos/
|   |-- prescriptions/
|   |-- sales-history/
|-- requests/
|   |-- history/
|-- settings/
|-- staffs/
```

#### Analisis `medical-records`

- `page.js` menampilkan daftar rekam medis.
- `upload/page.js` dipakai untuk membuat draft baru dan mengedit draft yang belum final.
- Alur data rekam medis terhubung ke service backend melalui `src/services/hospitalService.js`.

### 2. `src/components`

Folder ini berisi komponen UI yang dipakai ulang di banyak halaman.

```text
src/components/
|-- features/
|   |-- admin/
|   |-- faskes/
|   |-- SettingPage.js
|-- landing/
|   |-- faq/
|-- layout/
|-- shared/
|-- ui/
|-- MedicalRecordWizard.jsx
```

#### Keterangan `src/components`

- `layout`: komponen layout global seperti navbar, sidebar, dan footer.
- `landing`: komponen untuk halaman landing page seperti hero, CTA, feature grid, FAQ, dan workflow.
- `features`: komponen khusus per role atau modul, misalnya admin logs, admin users, dan doctor select untuk faskes.
- `shared`: komponen lintas halaman seperti session timeout.
- `ui`: komponen UI kecil dan reusable, misalnya link hash blockchain.
- `MedicalRecordWizard.jsx`: komponen khusus untuk alur wizard rekam medis jika dipakai di halaman tertentu.

### 3. `src/services`

Folder ini berisi wrapper API untuk komunikasi ke backend.

```text
src/services/
|-- doctorService.js
|-- hospitalService.js
|-- patientService.js
```

#### Keterangan `src/services`

- `hospitalService.js`: layanan utama untuk data rumah sakit/faskes, termasuk profile, audit, dan medical record.
- `doctorService.js`: layanan data dokter.
- `patientService.js`: layanan data pasien.

### 4. `src/lib`

```text
src/lib/
|-- api.js
|-- blockchain.js
|-- wallet.js
```

#### Keterangan `src/lib`

- `api.js`: helper request ke backend.
- `blockchain.js`: helper terkait integrasi blockchain.
- `wallet.js`: helper terkait wallet atau koneksi akun.

### 5. `src/config`

```text
src/config/
|-- env.js
```

#### Keterangan `src/config`

- `env.js`: konfigurasi environment dan nilai yang dipakai lintas modul.

## Pola Struktur Yang Terlihat

1. Struktur project mengikuti pemisahan berdasarkan role: admin, faskes, dan pasien.
2. Halaman utama disusun langsung di `src/app`, sedangkan komponen logic dan UI dipisah ke `src/components`.
3. Semua interaksi ke backend dikonsolidasikan di `src/services`, sehingga halaman tidak memanggil API secara langsung terlalu banyak.
4. Halaman rekam medis memiliki alur yang cukup kompleks, jadi dipisahkan menjadi daftar data dan halaman upload/edit draft.

## Kesimpulan

Struktur folder project ini sudah rapi untuk aplikasi healthcare berbasis Next.js karena:
- routing dan halaman dipisah jelas di `src/app`
- komponen reusable terkonsentrasi di `src/components`
- pemanggilan API dipusatkan di `src/services`
- aset dan dokumentasi tidak bercampur dengan source code utama

Kalau ingin, dokumen ini bisa dilanjutkan lagi menjadi versi yang lebih detail per fitur, misalnya fokus hanya ke modul faskes, admin, atau pasien.
