1. Overview & Objectives
Satu Data adalah platform manajemen rekam medis berbasis blockchain yang memberikan hak kontrol penuh kepada pasien atas data kesehatan mereka. Rumah sakit atau tenaga medis harus mendapatkan izin eksplisit dari pasien untuk mengakses data tersebut.
Core Objectives:
Data Ownership: Pasien adalah pemilik tunggal data medis mereka.
Granular Access Control: Pasien bisa memberikan, menolak, atau mencabut akses data kapan saja.
Audit Trail: Setiap permintaan dan pemberian akses tercatat abadi di blockchain.
Monetization/Cost Sharing: Rumah sakit menanggung biaya gas fee saat meminta akses data.
2. User Personas & Auth Model
Sesuai dengan rencana, otentikasi akan mengkombinasikan akun web tradisional (WEB2) dan crypto wallet.
Pasien:
Login menggunakan email/password + koneksi ke MetaMask (1 user = 1 wallet address).
Aktivitas: Melihat riwayat penyakit, menerima/menolak permintaan akses dari RS, mencabut akses.
Rumah Sakit / Dokter (Institusi):
Login menggunakan akun institusi resmi yang terverifikasi + wallet address institusi.
Aktivitas: Meminta akses data pasien, mengunggah rekam medis baru (setelah diizinkan), membayar gas fee.
3. System Architecture & Data Flow
Untuk menjaga performa dan efisiensi biaya, sistem dibagi menjadi dua bagian:



Alur Kerja Utama (Pemberian Izin & Penarikan Data):
Permintaan Data: RS memasukkan ID Pasien atau Wallet Address pasien di aplikasi → RS mengirim request akses (memicu transaksi Blockchain dan membayar gas fee).
Persetujuan Pasien: Pasien mendapatkan notifikasi → Pasien menyetujui lewat MetaMask (mengubah status consent di Smart Contract menjadi true).
Pengambilan Data: Backend Express.js memeriksa status di Smart Contract. Jika true, Backend mengambil data medis dari MySQL, mendekripsinya, dan menampilkannya di dashboard RS.
Penarikan Data (Revoke): Pasien mengeklik "Tarik Data" → Transaksi dikirim ke Smart Contract untuk mengubah status consent kembali menjadi false. RS tidak bisa lagi melihat data tersebut.
4. Key Functional Requirements (Fitur Utama)
Pasien Module
Wallet Integration: Menghubungkan akun Satu Data dengan MetaMask.
Consent Manager Panel: Daftar rumah sakit yang sedang meminta akses atau sudah memiliki akses, lengkap dengan tombol "Approve" dan "Revoke (Tarik Data)".
Medical History Timeline: Melihat daftar rekam medis miliknya sendiri yang tersimpan di off-chain.

Rumah Sakit Module
Request Access Form: Input alamat wallet pasien untuk meminta jenis data tertentu (misal: Rekam Medis Umum, Lab, atau Radiologi).
Upload Medical Record: Menu untuk menambahkan rekam medis baru setelah pasien memberikan izin tulis (write access).
Patient Data Viewer: Halaman untuk membaca data pasien selama masa izin masih aktif.
5. Technical Stack & Smart Contract Specification
Technical Stack:
Frontend: Next.js (Page/App Router) + Tailwind CSS + Ethers.js / Wagmi (untuk interaksi MetaMask).
Backend API: Express.js + Node.js (bertindak sebagai jembatan off-chain dan pengelola enkripsi).
Blockchain Dev Environemnt: Hardhat + Solidity (Smart Contract).
Database: MySQL (via XAMPP untuk lokal).

Struktur Dasar Smart Contract (Solidity Blueprint):
Secara garis besar, Smart Contract kamu minimal akan memiliki struktur seperti ini:
SOLIDITY:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SatuData {
    
    struct AccessRequest {
        bool isApproved;
        uint256 expiryTime; // Jika ingin aksesnya otomatis kedaluwarsa
        string dataHash;    // Pointer ke data spesifik di off-chain
    }

    // Mapping: Alamat Pasien => (Alamat RS => Status Akses)
    mapping(address => mapping(address => AccessRequest)) public permissions;

    event AccessRequested(address indexed patient, address indexed hospital);
    event AccessGranted(address indexed patient, address indexed hospital);
    event AccessRevoked(address indexed patient, address indexed hospital);

    // RS meminta akses
    function requestAccess(address _patient) public payable {
        // RS membayar gas fee di sini (atau mekanisme kompensasi)
        emit AccessRequested(_patient, msg.sender);
    }

    // Pasien memberikan akses
    function grantAccess(address _hospital, string memory _dataHash) public {
        permissions[msg.sender][_hospital] = AccessRequest(true, block.timestamp + 1 days, _dataHash);
        emit AccessGranted(msg.sender, _hospital);
    }

    // Pasien menarik kembali datanya
    function revokeAccess(address _hospital) public {
        permissions[msg.sender][_hospital].isApproved = false;
        emit AccessRevoked(msg.sender, _hospital);
    }
}

6. Keamanan & Privasi Data (Crucial Notes)
Karena ini data kesehatan, kamu perlu memperhatikan aspek ini bahkan sejak fase brainstorming:
Enkripsi Off-chain: Data di MySQL jangan disimpan dalam bentuk teks biasa (plain text). Gunakan enkripsi simetris (seperti AES-256) di level Express.js sebelum masuk ke MySQL. Kunci dekripsinya bisa diturunkan dari tanda tangan (signature) MetaMask pasien.
Mekanisme Revoke Nyata: Saat status di blockchain diubah jadi false, pastikan Backend Express.js kamu secara ketat menolak permintaan API dari RS tersebut.
7. Next Steps / Milestone Pengembangan
Untuk membangun proyek ini ke depannya, ini urutan langkah yang akan dilakukan:
Milestone 1 (Smart Contract & Local Chain): Membuat Smart Contract di Hardhat. Tes fungsi requestAccess, grantAccess, dan revokeAccess lewat unit testing lokal Hardhat.
Milestone 2 (Backend & DB Setup): Setup Express.js dan MySQL. Untuk skema tabel untuk user, rumah sakit, dan meta-data rekam medis. Lanjut integrasikan Express dengan Ethers.js supaya backend bisa membaca kondisi smart contract.
Milestone 3 (Frontend Integration): Setup Next.js, mengintegrasikan login MetaMask. Hubungkan tombol-tombol di UI dengan fungsi-fungsi smart contract yang sudah dibuat.
Milestone 4 (End-to-End Testing): Mencoba simulasi penuh: Akun RS meminta data → Akun Pasien menyetujui → Akun RS berhasil baca → Akun Pasien klik revoke → Akun RS kehilangan akses.
