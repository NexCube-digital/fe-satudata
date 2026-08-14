export interface InvoiceItem {
  deskripsi: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface Invoice {
  id: string | number;
  noInvoice: string;
  patientName: string;
  faskesName: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'unpaid' | 'paid' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface ServiceTariff {
  id: string | number;
  namaLayanan: string;
  kategori: 'medis' | 'penunjang' | 'ruangan';
  tarif: number;
  faskesId: string | number;
  status: 'aktif' | 'nonaktif';
}
