# Documentation: New Directory Structure (`structur.md`) - v3

Dokumen ini berisi pemetaan struktur folder dan file proyek **SatuData (FE-SatuData)** terkini yang telah direkonstruksi penuh menggunakan **TypeScript (`.ts` dan `.tsx`)** sesuai dengan spesifikasi arsitektur terbaru.

---

## 1. Top-Level Repository Ecosystem (`SatuData`)

Repository ini terdiri dari 3 sub-sistem utama yang saling terintegrasi:

```text
SatuData/
├── fe-satudata/      # Frontend Application (Next.js 15, TypeScript, Tailwind CSS, Ethers.js)
├── be-satudata/      # Backend REST API Server (Node.js, Express, Sequelize ORM, MySQL)
└── bc-satudata/      # Blockchain Smart Contract Layer (Hardhat, Solidity, Ethers.js)
```

---

## 2. Pemetaan Struktur Folder Frontend Terbaru (`fe-satudata`)

Berikut adalah struktur folder dan perintilan file dari proyek Frontend (`fe-satudata`):

```text
fe-satudata/
├── docs/                                  # Dokumentasi proyek versi bertahap
│   ├── v1/                                # Dokumentasi Tahap 1
│   ├── v2/                                # Dokumentasi Tahap 2
│   └── v3/                                # Dokumentasi Tahap 3 (Arsitektur Terkini)
│       ├── new-struktur.md                # Spesifikasi Rancangan Arsitektur Barunya
│       └── structur.md                    # [File Ini] Pemetaan Struktur Folder Terimplementasi
│
├── public/                                # Static Assets
│   ├── favicon.ico
│   ├── images/                            # Assets format lowercase-kebab
│   │   ├── logo.png
│   │   ├── satusehat.jfif
│   │   └── doctor/                        # Foto Profil Dokter
│   │       ├── Dr-Baharuddin.webp
│   │       ├── Dr-Feris.webp
│   │       ├── Dr-Heru.webp
│   │       └── ...
│   └── svgs/
│
└── src/
    ├── app/                               # 🌐 APP ROUTER (Khusus Routing, Layout & Page Wrapper)
    │   ├── layout.tsx                     # Root Layout Wrapper
    │   ├── page.tsx                       # Landing Page / Home
    │   ├── not-found.tsx                  # Custom 404 Page
    │   ├── loading.tsx                    # Global Fallback Loading
    │   ├── error.tsx                      # Global Error Boundary
    │   ├── globals.css                    # Styling global & Tailwind directives
    │   │
    │   ├── (public)/                      # 💡 Route Group: Halaman Publik (Tanpa Auth)
    │   │   ├── faq/
    │   │   │   └── page.tsx
    │   │   └── faskes/
    │   │       └── page.tsx
    │   │
    │   ├── (auth)/                        # 💡 Route Group: Autentikasi
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   ├── reset-password/page.tsx
    │   │   └── activate/page.tsx
    │   │
    │   └── dashboard/                     # 💡 Area Dashboard Terproteksi (Dynamic Role)
    │       ├── layout.tsx                 # Dashboard Layout (Sidebar + Header Nav)
    │       ├── page.tsx                   # Overview Dashboard
    │       │
    │       ├── admin/                     # Dashboard Super Admin
    │       │   ├── page.tsx
    │       │   ├── logs/page.tsx
    │       │   ├── settings/page.tsx
    │       │   ├── faskes/
    │       │   │   ├── page.tsx
    │       │   │   └── add/page.tsx
    │       │   └── users/
    │       │       ├── page.tsx
    │       │       ├── faskes/page.tsx
    │       │       └── pasien/page.tsx
    │       │
    │       ├── faskes/                    # Dashboard Rumah Sakit / Faskes
    │       │   ├── page.tsx
    │       │   ├── audit/page.tsx
    │       │   ├── geotagging/page.tsx
    │       │   ├── patient-flow/page.tsx
    │       │   ├── settings/page.tsx
    │       │   ├── staffs/page.tsx
    │       │   │
    │       │   ├── doctor/                # Manajemen Dokter
    │       │   │   ├── page.tsx
    │       │   │   ├── add/page.tsx
    │       │   │   ├── list/page.tsx
    │       │   │   ├── services/page.tsx
    │       │   │   └── specialties/page.tsx
    │       │   │
    │       │   ├── finance/               # Keuangan, Tarif & Tagihan
    │       │   │   ├── page.tsx
    │       │   │   ├── history/page.tsx
    │       │   │   ├── invoice/page.tsx
    │       │   │   ├── layanan/
    │       │   │   │   ├── page.tsx
    │       │   │   │   └── sublayanan/page.tsx
    │       │   │   ├── layanan-penunjang/
    │       │   │   │   ├── page.tsx
    │       │   │   │   └── [id]/page.tsx
    │       │   │   ├── pelayanan-medis/
    │       │   │   │   ├── page.tsx
    │       │   │   │   └── [id]/page.tsx
    │       │   │   ├── ruangan/page.tsx
    │       │   │   └── tarif-layanan/page.tsx
    │       │   │
    │       │   ├── medical-records/       # Rekam Medis (EMR)
    │       │   │   ├── page.tsx
    │       │   │   ├── upload/page.tsx
    │       │   │   ├── layanan/page.tsx
    │       │   │   ├── [id]/page.tsx
    │       │   │   ├── [id]/edit/page.tsx
    │       │   │   └── invoice/
    │       │   │       ├── page.tsx
    │       │   │       └── [invoiceId]/page.tsx
    │       │   │
    │       │   ├── patients/              # Data Pasien
    │       │   │   ├── page.tsx
    │       │   │   └── [id]/page.tsx
    │       │   │
    │       │   ├── pharmacy/              # Modul Farmasi & POS Kasir
    │       │   │   ├── page.tsx
    │       │   │   ├── inventory/page.tsx
    │       │   │   ├── prescriptions/page.tsx
    │       │   │   ├── sales-history/page.tsx
    │       │   │   └── pos/
    │       │   │       ├── page.tsx
    │       │   │       └── invoice/[invoiceId]/page.tsx
    │       │   │
    │       │   └── requests/              # Permintaan Akses Izin Pasien
    │       │       ├── page.tsx
    │       │       └── history/page.tsx
    │       │
    │       └── pasien/                    # Dashboard Pasien
    │           ├── page.tsx
    │           ├── history/page.tsx
    │           ├── settings/page.tsx
    │           ├── consent/
    │           │   ├── page.tsx
    │           │   └── history/page.tsx
    │           └── records/
    │               ├── page.tsx
    │               └── history/page.tsx
    │
    ├── components/                        # 🧩 REACT UI COMPONENTS
    │   ├── ui/                            # Atomic / Primitive Components (TypeScript)
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── modal.tsx
    │   │   ├── table.tsx
    │   │   ├── Toast.tsx
    │   │   ├── ModernSelect.tsx
    │   │   ├── SearchableSelect.tsx
    │   │   ├── LoadingScreen.tsx
    │   │   ├── DigitalSignatureCanvas.tsx
    │   │   ├── TxHashLink.tsx
    │   │   └── NotFound.tsx
    │   │
    │   ├── layout/                        # Core Layout Components
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── LandingNavbar.tsx
    │   │   ├── LandingFooter.tsx
    │   │   ├── Layout.tsx
    │   │   └── setting.tsx
    │   │
    │   ├── shared/                        # Shared Helpers Across Modules
    │   │   ├── digital-signature-canvas.tsx
    │   │   ├── tx-hash-link.tsx
    │   │   ├── searchable-select.tsx
    │   │   └── SessionTimeout.tsx
    │   │
    │   └── features/                      # 💡 Feature-Based UI Modules
    │       ├── landing/                   # Hero, FeatureGrid, DoctorShowcase, FAQ
    │       ├── admin/                     # LogsComponent, UsersComponent
    │       ├── faskes/
    │       │   ├── medical-records/       # MedicalRecordMain, MedicalRecordWizard, MedicalRecordUpdate
    │       │   │   └── forms/             # FormIGD.tsx, FormRanap.tsx, FormRajal.tsx, FormBedah.tsx, FormODC.tsx, FormRehab.tsx, FormRujuk.tsx, DeathCertificate.tsx
    │       │   ├── doctor/                # ModernDoctorSelect
    │       │   └── pharmacy/              # PrescriptionList
    │       └── patient/                   # ConsentControl, PatientRecordHistory (index.ts)
    │
    ├── types/                             # 🔷 TYPE DEFINITIONS & SCHEMAS (.ts)
    │   ├── api.ts                         # API Response & Pagination Types
    │   ├── auth.ts                        # User, Role, Session Types
    │   ├── faskes.ts                      # Faskes, Doctor, Service Unit Types
    │   ├── medical-record.ts              # EMR, Form & Diagnosis Types
    │   ├── pharmacy.ts                    # Stock, Prescription & POS Types
    │   ├── finance.ts                     # Invoice, Tariff & Room Types
    │   ├── blockchain.ts                  # Access Control & Tx Types
    │   └── global.d.ts                    # Global Window Types (snap, L, ethereum)
    │
    ├── services/                          # 🔌 API SERVICES (TypeScript Client Calls)
    │   ├── auth-service.ts
    │   ├── doctor-service.ts
    │   ├── faskes-service.ts
    │   ├── medical-record-service.ts
    │   ├── pharmacy-service.ts
    │   ├── finance-service.ts
    │   ├── patientService.ts
    │   ├── invoiceService.ts
    │   ├── servicePriceService.ts
    │   ├── serviceUnitService.ts
    │   └── specialtyService.ts
    │
    ├── hooks/                             # 🎣 CUSTOM REACT HOOKS
    │   ├── use-auth.ts
    │   ├── use-debounce.ts
    │   ├── useAuth.ts
    │   ├── faskes/
    │   │   ├── use-medical-records.ts
    │   │   ├── use-doctor.ts
    │   │   └── useDashboard.ts
    │   ├── patient/
    │   │   ├── useDashboard.ts
    │   │   ├── useHistory.ts
    │   │   └── useRecords.ts
    │   └── blockchain/
    │       └── use-blockchain-verify.ts
    │
    ├── lib/                               # ⚙️ EXTERNAL INTEGRATIONS & UTILS
    │   ├── api.ts                         # Primary API Client Wrapper
    │   ├── api-client.ts                  # Axios/Fetch Instance with Bearer Token
    │   ├── notify.ts                      # Floating Toast & Bell Notif Push
    │   ├── wallet.ts                      # MetaMask Binding Manager
    │   ├── blockchain.ts                  # Sepolia Explorer URL Formatter
    │   └── blockchain/
    │       ├── provider.ts
    │       ├── contract-abi.json
    │       └── client.ts
    │
    ├── utils/                             # General Helpers
    │   └── masking.ts                     # NIK & SIP License Masking
    │
    └── constants/                         # Constant Lookups
        ├── env.ts                         # Env Config
        ├── navigation.ts                  # Sidebar Links per Role
        └── icd-10.ts                      # ICD-10 Master Database
```

---

> **Dipelihara Oleh**: Tim Pengembang SatuData  
> **Terakhir Diperbarui**: 14 Agustus 2026
