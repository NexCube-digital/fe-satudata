# Product Requirements Document (PRD)

## 1. Product Overview
SatuData Frontend adalah antarmuka web untuk pasien, fasilitas kesehatan, dokter, dan admin agar dapat mengelola akses data kesehatan berbasis blockchain secara aman, transparan, dan mudah digunakan.

Frontend berfungsi sebagai lapisan interaksi utama untuk:
- login dan otentikasi pengguna
- sinkronisasi data ke backend API
- integrasi wallet MetaMask
- tampilan dashboard sesuai role
- visualisasi riwayat akses, rekam medis, dan audit trail blockchain

## 2. Problem Statement
Pengelolaan data kesehatan sering terhambat oleh:
- akses data yang tidak transparan
- sulitnya melacak riwayat permintaan akses
- proses persetujuan yang tidak terstandar
- minimnya kontrol pasien terhadap data medisnya sendiri

Frontend SatuData harus menyederhanakan proses tersebut melalui UI yang jelas, responsif, dan terhubung dengan backend serta blockchain.

## 3. Product Goals
Tujuan utama frontend:
- memudahkan pengguna masuk sesuai role
- menampilkan data kesehatan dan transaksi blockchain secara mudah dipahami
- memberi kontrol penuh kepada pasien atas izin akses data
- membantu faskes mengajukan akses, mengunggah rekam medis, dan melihat audit log
- memastikan setiap tx hash dan jejak audit mudah ditelusuri ke Sepolia Etherscan

## 4. Success Metrics
Keberhasilan frontend dapat diukur melalui:
- tingkat keberhasilan login dan registrasi
- jumlah pengguna yang berhasil menghubungkan wallet
- jumlah request akses yang diproses tanpa error UI
- waktu yang dibutuhkan pengguna untuk menemukan riwayat rekam medis atau audit log
- tingkat penggunaan halaman dashboard per role
- rendahnya error rendering dan broken navigation

## 5. Target Users
### Pasien
- melihat riwayat rekam medis pribadi
- menerima atau menolak permintaan akses dari faskes
- mencabut akses yang sudah diberikan
- melihat audit trail dan transaksi blockchain

### Fasilitas Kesehatan
- meminta akses data pasien
- melihat daftar pasien dengan izin aktif
- mengunggah rekam medis baru
- memantau log aktivitas dan tx hash

### Dokter
- membantu proses pengisian data medis di lingkungan faskes
- melihat informasi pasien sesuai izin yang berlaku

### Admin
- memantau log sistem, user, dan aktivitas blockchain
- melihat status node atau koneksi jaringan

## 6. Scope
### In Scope
- halaman landing dan informasi produk
- registrasi dan login
- aktivasi akun
- lupa password dan reset password
- dashboard per role: pasien, faskes, admin
- integrasi wallet MetaMask
- tampilan daftar rekam medis
- tampilan detail rekam medis
- daftar consent history
- daftar audit log blockchain
- link tx hash ke explorer Sepolia
- pencarian, filter, pagination, dan modal detail

### Out of Scope
- perubahan smart contract langsung dari frontend tanpa backend support
- editing database secara manual dari UI
- fitur mobile app native
- chat real time antar pengguna
- analitik lanjutan berbasis machine learning

## 7. Key User Flows
### 7.1 Patient Flow
1. Pasien login.
2. Pasien membuka dashboard.
3. Pasien melihat request akses dari faskes.
4. Pasien approve, reject, atau revoke akses.
5. Pasien melihat rekam medis dan audit trail.

### 7.2 Faskes Flow
1. Faskes login.
2. Faskes membuka halaman request akses.
3. Faskes mengajukan akses data pasien.
4. Faskes menunggu status approval.
5. Faskes mengunggah rekam medis jika akses aktif.
6. Faskes melihat tx hash dan detail rekam medis.

### 7.3 Admin Flow
1. Admin login.
2. Admin membuka dashboard audit.
3. Admin melihat daftar aktivitas sistem dan blockchain.
4. Admin menelusuri tx hash ke Sepolia Etherscan jika diperlukan.

## 8. Functional Requirements
### 8.1 Authentication
- User dapat login dengan identifier yang didukung backend.
- User dapat registrasi sesuai role.
- User dapat aktivasi akun melalui token email.
- User dapat reset password.
- Session token harus tersimpan dengan aman di storage yang sudah disepakati.

### 8.2 Wallet Integration
- User dapat menghubungkan wallet MetaMask.
- Frontend menampilkan status koneksi wallet.
- Wallet yang terhubung harus sesuai dengan user yang login bila diperlukan.

### 8.3 Dashboard Rendering
- UI berbeda untuk role pasien, faskes, dan admin.
- Data harus diambil dari backend service yang sesuai.
- Loading, empty state, dan error state harus ditampilkan dengan jelas.

### 8.4 Medical Records
- Faskes dapat melihat daftar rekam medis.
- Daftar harus mendukung pencarian.
- Kolom tx hash dapat diklik dan membuka Sepolia Etherscan.
- User dapat membuka detail rekam medis dengan klik baris atau elemen yang disediakan.

### 8.5 Consent Management
- Pasien dapat melihat daftar request akses.
- Pasien dapat approve, reject, dan revoke.
- Status consent harus tampil jelas dan mudah dibaca.

### 8.6 Audit Logs
- Sistem menampilkan event blockchain dan audit trail.
- Tx hash harus dapat diklik ke Sepolia Etherscan.
- Log harus mendukung pencarian dan filter dasar.

## 9. UI/UX Requirements
- Layout harus responsif di desktop dan mobile.
- Hierarki informasi harus jelas.
- Tombol aksi utama harus mudah ditemukan.
- Tx hash harus menonjol tetapi tidak mengganggu layout.
- Modal harus bisa ditutup dengan tombol close dan klik area luar modal.
- Pengguna harus mendapat umpan balik visual untuk loading, success, error, dan empty state.

## 10. Data & Integration Requirements
Frontend wajib terhubung ke:
- Backend REST API Express
- layanan auth
- layanan dashboard pasien dan faskes
- layanan audit log
- layanan blockchain status dan tx hash

Data dari backend harus dipetakan ke komponen UI tanpa mengubah makna status atau identifier yang sudah ada.

## 11. Blockchain Requirements
- Tx hash yang ditampilkan di UI harus mengarah ke Sepolia Etherscan.
- Jika tx hash tersedia, user dapat membuka transaksi pada explorer eksternal.
- Jika data off-chain, UI harus menandai status tersebut dengan jelas.
- Tampilan tx hash tidak boleh dipotong jika masih memungkinkan untuk dibaca penuh.

## 12. Non-Functional Requirements
- UI harus stabil dan tidak mudah rusak oleh data kosong.
- Rendering harus cukup cepat untuk data tabel yang besar.
- Komponen harus reusable jika dipakai di banyak halaman.
- Error handling harus jelas dan tidak membingungkan pengguna.
- Aksesibilitas dasar harus diperhatikan, termasuk keyboard navigation pada modal dan tabel yang bisa diklik.

## 13. Constraints
- Backend dan blockchain mungkin berjalan di environment lokal atau Sepolia.
- Sebagian data bisa berasal dari simulasi jika node tidak aktif.
- Detail data medis hanya boleh tampil jika izin akses sesuai.
- Perubahan frontend harus tetap mengikuti struktur role yang sudah ada.

## 14. Acceptance Criteria
Frontend dianggap memenuhi PRD jika:
- user dapat login dan masuk ke dashboard sesuai role
- tx hash pada semua halaman utama bisa diklik ke Sepolia Etherscan
- daftar rekam medis bisa dibaca dengan urutan kolom yang konsisten
- detail rekam medis dapat dibuka dengan klik baris
- modal dapat ditutup dengan tombol close dan klik luar modal
- consent flow dan audit log tampil tanpa error UI utama
- halaman tetap usable saat data kosong atau backend tidak merespons

## 15. Future Enhancements
- dark mode yang tetap sesuai identitas brand
- export PDF atau CSV untuk rekam medis dan log
- status realtime transaksi blockchain
- notifikasi in-app untuk approval consent
- search yang lebih canggih dengan highlight hasil pencarian
- komponen tx hash universal untuk seluruh aplikasi

## 16. Notes
Dokumen ini ditulis untuk frontend FE SatuData dan dapat diperbarui seiring perubahan pada backend, smart contract, atau alur bisnis.
