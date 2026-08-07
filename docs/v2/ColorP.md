# Implementation Plan - Update Color Palette & Hospital Status Colors

Updates the application's secondary/accent color scheme to **Teal / Cyan / Mint Green** (clinical hygiene, freshness, scrubs aesthetic) and standardizes hospital status colors for triage, medical record approvals, lab indicators, pharmacy, and transactions.

## Color Specification

### 1. Secondary / Accent Palette (Higienitas & Kebersihan Klinis)
- **Primary Teal**: `#0f766e` / `teal-700`
- **Secondary Teal/Mint**: `#14b8a6` / `teal-500`
- **Cyan Accent**: `#06b6d4` / `cyan-500`
- **Mint Green Highlight**: `#2dd4bf` / `teal-400` / `emerald-400`

### 2. Standard Hospital Status Colors
- **Success / Normal / Disetujui**: `#16A34A` (Hijau)
  - *Guna*: Hasil lab normal, status rekam medis disetujui, pendaftaran selesai.
- **Warning / Pending / Observasi**: `#D97706` (Amber / Oranye-Kuning)
  - *Guna*: Menunggu persetujuan akses rekam medis, obat dalam racikan, pembayaran pending.
- **Danger / Critical / IGD / Alergi**: `#DC2626` (Merah)
  - *Guna*: Triage emergency/IGD, nilai lab kritis, riwayat alergi obat berat, staf non-aktif.
- **Info / Routine**: `#0284C7` (Biru Muda / Sky Blue)
  - *Guna*: Catatan dokter, instruksi perawatan umum.

---

## User Review Required

> [!IMPORTANT]
> The theme transition removes all legacy rose/pink primary accents and replaces them with clinical **Teal / Cyan / Mint Green**. Status badges across all dashboards (Faskes & Pasien) will strictly adhere to `#16A34A`, `#D97706`, `#DC2626`, and `#0284C7`.

---

## Proposed Changes

### Styling & Theme Tokens

#### [MODIFY] [globals.css](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/globals.css)
- Replace rose/pink radial gradients in `body` with clinical Teal, Mint, and Cyan background glows.
- Define `@theme inline` variables: `--color-secondary`, `--color-accent`, `--color-mint`, and `--color-status-*` variables (`#16A34A`, `#D97706`, `#DC2626`, `#0284C7`).
- Update utility classes (`text-gradient-teal`, `bg-radial-glow`, `glass-panel`, selection highlight) to reflect the Teal/Mint green identity.

---

### Core Layout Components

#### [MODIFY] [Sidebar.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/layout/Sidebar.js)
- Update active navigation highlights, icon badges, and header branding from rose/pink to Teal/Mint Green.

#### [MODIFY] [Navbar.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/layout/Navbar.js)
- Update active indicator pill, avatar ring, and notification badge colors to Teal/Cyan/Mint.

#### [MODIFY] [hero.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/landing/hero.js)
- Replace pink hero highlights and buttons with Teal/Cyan gradients (`from-teal-600 to-cyan-600`).

---

### Dashboard Status Indicators & Badges

#### [MODIFY] [patient-flow/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/patient-flow/page.js)
- Update triage and patient flow stage badges:
  - Disetujui/Selesai: `#16A34A`
  - Pending/Proses: `#D97706`
  - IGD/Emergency: `#DC2626`
  - Routine Care: `#0284C7`

#### [MODIFY] [medical-records/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/medical-records/page.js)
- Standardize lab result badges (Normal `#16A34A`, Kritis `#DC2626`), access request statuses (Disetujui `#16A34A`, Menunggu `#D97706`, Ditolak `#DC2626`), and physician notes (`#0284C7`).

#### [MODIFY] [prescriptions/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/pharmacy/prescriptions/page.js) & [PrescriptionList.jsx](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/components/PrescriptionList.jsx)
- Update prescription status colors: Obat Selesai `#16A34A`, Dalam Racikan `#D97706`, Resep Dibatalkan/Alergi `#DC2626`, Routine Care `#0284C7`.

#### [MODIFY] [requests/page.js](file:///c:/Xampp/htdocs/SatuData/fe-satudata/src/app/dashboard/faskes/requests/page.js)
- Apply `#16A34A` for approved requests, `#D97706` for pending requests, `#DC2626` for rejected/critical requests.

---

## Verification Plan

### Automated Verification
- Run Next.js build or dev check to confirm no syntax or Tailwind CSS compilation errors:
  - Command: `npm run build` inside `fe-satudata` directory.

### Manual Verification
- Visual inspection of the updated color theme on localhost (`http://localhost:3000` or running dev server):
  - Landing page accent colors (Teal/Cyan/Mint Green).
  - Faskes & Patient dashboards sidebar & navbar highlights.
  - Status badges for Normal (`#16A34A`), Pending (`#D97706`), Critical/IGD/Alergi (`#DC2626`), Routine Care (`#0284C7`).
