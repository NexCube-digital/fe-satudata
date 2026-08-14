export interface Medicine {
  id: string | number;
  kodeObat: string;
  namaObat: string;
  kategori: string;
  satuan: string;
  hargaJual: number;
  stok: number;
  minStok: number;
  expiredDate: string;
}

export interface PrescriptionItem {
  medicineId: string | number;
  medicineName: string;
  jumlah: number;
  dosis: string;
  harga: number;
  subtotal: number;
}

export interface Prescription {
  id: string | number;
  medicalRecordId: string | number;
  patientName: string;
  doctorName: string;
  items: PrescriptionItem[];
  totalPrice: number;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PosItem {
  medicineId: string | number;
  namaObat: string;
  qty: number;
  harga: number;
  subtotal: number;
}

export interface PosTransaction {
  id: string | number;
  invoiceId: string;
  items: PosItem[];
  subtotal: number;
  diskon: number;
  total: number;
  bayar: number;
  kembali: number;
  metodePembayaran: 'cash' | 'qris' | 'transfer' | 'insurance';
  createdAt: string;
}
