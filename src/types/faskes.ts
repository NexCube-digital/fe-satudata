export interface Faskes {
  id: string | number;
  nama: string;
  kode: string;
  kategori: string;
  alamat: string;
  telepon: string;
  email: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  status: 'aktif' | 'nonaktif';
  walletAddress?: string;
}

export interface Doctor {
  id: string | number;
  nama: string;
  nip: string;
  sip: string;
  spesialisasi: string;
  email: string;
  telepon?: string;
  foto?: string;
  faskesId?: string | number;
  status: 'aktif' | 'nonaktif';
}

export interface Specialty {
  id: string | number;
  nama: string;
  kode: string;
  deskripsi?: string;
}

export interface ServiceUnit {
  id: string | number;
  namaUnit: string;
  kodeUnit: string;
  kategori: string;
  deskripsi?: string;
  status: 'aktif' | 'nonaktif';
}

export interface Staff {
  id: string | number;
  nama: string;
  nip: string;
  jabatan: string;
  email: string;
  telepon: string;
  faskesId: string | number;
}
