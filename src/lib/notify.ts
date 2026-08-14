import { apiPost } from '@/lib/api';

const ACTION_TO_TIPE: Record<string, string> = {
  success: 'info',
  error: 'info',
  info: 'info',
  rekam_medis_baru: 'rekam_medis_baru',
  rekam_medis_diperbarui: 'rekam_medis_diperbarui',
  permintaan_akses: 'permintaan_akses',
  akses_disetujui: 'akses_disetujui',
  akses_ditolak: 'akses_ditolak',
  akses_dicabut: 'akses_dicabut',
  reupload_blockchain: 'reupload_blockchain',
  tambah_pasien: 'tambah_pasien',
  tambah_dokter: 'tambah_dokter',
  pos_transaksi: 'pos_transaksi',
  penyerahan_resep: 'penyerahan_resep',
};

async function pushToNotificationBell({ tipe = 'info', message }: { tipe?: string; message: string }) {
  try {
    await apiPost('/api/notifications/push', { tipe, message });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('newNotification'));
    }
  } catch (err: any) {
    console.warn('Gagal push notifikasi ke bell:', err?.message);
  }
}

export function notify(
  setToast: any,
  { type = 'info', title, message, tipe, pushBell = true }: { type?: string; title?: string; message: string; tipe?: string; pushBell?: boolean }
) {
  setToast({ show: true, type, title, message });
  setTimeout(() => setToast({ show: false }), 4500);

  if (pushBell && type !== 'error') {
    const resolvedTipe = tipe || ACTION_TO_TIPE[type] || 'info';
    pushToNotificationBell({ tipe: resolvedTipe, message: title ? `${title}: ${message}` : message });
  }
}

export async function pushNotification({ tipe = 'info', message }: { tipe?: string; message: string }) {
  return pushToNotificationBell({ tipe, message });
}

export default notify;
