# Implementation Plan - Tahap 4: Audit Trail Logging Staf & Dokumentasi Manual RBAC

Implementasi pencatatan rekam jejak (*Audit Trail Logging*) untuk setiap aksi staf Faskes, pengujian integrasi akhir (End-to-End), serta pembuatan panduan manual penggunaan sistem sub-akun dan matrix hak akses (RBAC).

## User Review Required

> [!IMPORTANT]
> 1. **Pencatatan Audit Trail Staf**:
>    Setiap penambahan staf, pengubahan role, maupun pengeditan checklist hak akses akan dicatat dalam tabel `audit_logs` agar Admin RS dapat melacak riwayat aktivitas pengubahan wewenang.
> 2. **Dokumentasi & Panduan Operasional**:
>    Menyediakan berkas panduan operasional (*User Manual*) untuk Admin RS dan Staf Faskes.

## Open Questions

- Tidak ada pertanyaan tertunda.

## Proposed Changes

### Backend (`be-satudata`)

---

#### [MODIFY] [hospitalStaffService.js](file:///c:/Xampp/htdocs/SatuData/be-satudata/src/services/hospitalStaffService.js)
- Mengintegrasikan pencatatan `AuditLog` pada fungsi `createHospitalRole`, `updateHospitalRole`, `deleteHospitalRole`, `createHospitalStaff`, `updateHospitalStaff`, dan `deleteHospitalStaff`.

---

### Frontend & Dokumentasi (`fe-satudata`)

---

#### [NEW] [RBAC_USER_MANUAL.md](file:///c:/Xampp/htdocs/SatuData/fe-satudata/docs/v2/RBAC_USER_MANUAL.md)
- Dokumen panduan manual penggunaan sistem RBAC Sub-Akun Faskes yang menjelaskan:
  - Cara Admin RS menambahkan role custom dan mengatur checklist fitur.
  - Cara mendaftarkan akun staf RS.
  - Alur login staf dan penggunaan modul sesuai role (Informasi/Pendaftaran, Rekam Medis, Apoteker/POS, Admin RS).

---

## Verification Plan

### Automated Tests
- Menjalankan `node -c main.js` pada `be-satudata` untuk memastikan pencatatan audit log valid.
- Menjalankan lint/syntax check pada `fe-satudata`.

### Manual Verification
- Melakukan verifikasi alur lengkap mulai dari pembuatan role, pendaftaran staf, pengubahan matrix checklist, hingga pencatatan audit log di database.
