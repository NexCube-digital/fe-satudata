New Architecture for FE-SatuData

fe-satudata/
├── .env.local
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── package.json
│
├── public/                                # Static Assets
│   ├── favicon.ico
│   ├── images/                            # Format lowercase-kebab
│   │   ├── branding/                      # logo.png, kemenkes.png
│   │   └── doctors/                       # dr-baharuddin.webp, dr-feris.webp
│   └── svgs/
│
└── src/
    ├── app/                               # 🌐 APP ROUTER (Khusus Routing, Layout & Page Wrapper)
    │   ├── layout.tsx                     # Root Layout Wrapper
    │   ├── page.tsx                       # Landing Page / Home
    │   ├── not-found.tsx                  # Custom 404 Page
    │   ├── loading.tsx                    # Global Fallback Loading
    │   ├── error.tsx                      # Global Error Boundary
    │   ├── globals.css
    │   │
    │   ├── (public)/                      # 💡 Route Group: Halaman Publik (Tanpa Auth)
    │   │   ├── faq/
    │   │   │   └── page.tsx
    │   │   └── faskes/
    │   │       └── page.tsx
    │   │
    │   ├── (auth)/                        # 💡 Route Group: Autentikasi
    │   │   ├── layout.tsx                 # Card / Centered Layout Khusus Auth
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   ├── reset-password/page.tsx
    │   │   └── activate/page.tsx
    │   │
    │   └── dashboard/                     # 💡 Area Dashboard Terproteksi
    │       ├── layout.tsx                 # Dashboard Layout (Sidebar + Header Nav)
    │       ├── page.tsx                   # Redirect ke role masing-masing
    │       │
    │       ├── admin/                     # Dashboard Super Admin
    │       │   ├── page.tsx
    │       │   ├── logs/page.tsx
    │       │   └── users/page.tsx
    │       │
    │       ├── faskes/                    # Dashboard Rumah Sakit / Faskes
    │       │   ├── page.tsx
    │       │   ├── doctor/page.tsx
    │       │   ├── medical-records/
    │       │   │   ├── page.tsx
    │       │   │   ├── upload/page.tsx
    │       │   │   └── [id]/page.tsx
    │       │   ├── pharmacy/
    │       │   │   ├── inventory/page.tsx
    │       │   │   └── pos/page.tsx
    │       │   └── finance/
    │       │       └── invoice/page.tsx
    │       │
    │       └── pasien/                    # Dashboard Pasien
    │           ├── page.tsx
    │           ├── consent/page.tsx
    │           └── records/page.tsx
    │
    ├── components/                        # 🧩 REACT UI COMPONENTS
    │   ├── ui/                            # Atomic / Primitive Components (Shadcn UI style)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── modal.tsx
    │   │   ├── table.tsx
    │   │   ├── toast.tsx
    │   │   └── badge.tsx
    │   │
    │   ├── layout/                        # Core Layout Components
    │   │   ├── navbar.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── footer.tsx
    │   │   └── setting.tsx
    │   │
    │   ├── shared/                        # Reusable Business Components across modules
    │   │   ├── digital-signature-canvas.tsx
    │   │   ├── tx-hash-link.tsx           # Link Verifikasi Blockchain Explorer
    │   │   ├── session-timeout.tsx
    │   │   └── searchable-select.tsx
    │   │
    │   └── features/                      # 💡 Feature-Based UI Modules (Logic View)
    │       ├── landing/                   # Hero, FeatureGrid, DoctorShowcase
    │       ├── admin/                     # AdminLogsTable, UserManagement
    │       ├── faskes/
    │       │   ├── medical-records/       # MedicalRecordTable, MedicalRecordWizard
    │       │   │   └── forms/             # FormIGD.tsx, FormRanap.tsx, FormBedah.tsx
    │       │   ├── doctor/                # DoctorList, DoctorForm
    │       │   └── pharmacy/              # PrescriptionList, PosCheckout
    │       └── patient/                   # ConsentControl, PatientRecordHistory
    │
    ├── types/                             # 🔷 TYPE DEFINITIONS & SCHEMAS (.ts)
    │   ├── api.ts                         # Standard API Response Types (Meta, Pagination)
    │   ├── auth.ts                        # User, Role, Session Types
    │   ├── faskes.ts                      # Faskes, Doctor, Service Unit
    │   ├── medical-record.ts              # EMR, Diagnosis, Form Types
    │   ├── pharmacy.ts                    # Medicine, Stock, Prescription
    │   ├── finance.ts                     # Invoice, Tariff, Payment
    │   └── blockchain.ts                  # Access Control, Tx Logs
    │
    ├── services/                          # 🔌 API SERVICES (Axios Calls Ke Backend)
    │   ├── auth-service.ts
    │   ├── doctor-service.ts
    │   ├── faskes-service.ts
    │   ├── medical-record-service.ts
    │   ├── pharmacy-service.ts
    │   └── finance-service.ts
    │
    ├── hooks/                             # 🎣 CUSTOM REACT HOOKS
    │   ├── use-auth.ts
    │   ├── use-debounce.ts
    │   ├── faskes/
    │   │   ├── use-medical-records.ts
    │   │   └── use-doctor.ts
    │   └── blockchain/
    │       └── use-blockchain-verify.ts
    │
    ├── lib/                               # ⚙️ EXTERNAL INTEGRATIONS & UTILS
    │   ├── api-client.ts                  # Axios Instance + Interceptors (Token Bearer)
    │   ├── blockchain/                    # Ethers.js Wallet & Smart Contract Setup
    │   │   ├── provider.ts
    │   │   ├── contract-abi.json
    │   │   └── client.ts
    │   └── utils/                         # Pure Functions / Helpers
    │       ├── formatters.ts              # formatRupiah(), formatDate()
    │       ├── masking.ts                 # maskNIK(), maskWalletAddress()
    │       └── validators.ts              # Zod Schemas
    │
    └── constants/                         # 📌 CONSTANTS & LOOKUPS
        ├── env.ts                         # Env Variables with Type Safety
        ├── navigation.ts                  # Sidebar Links per Role
        └── icd-10.ts                      # Master Code ICD-10