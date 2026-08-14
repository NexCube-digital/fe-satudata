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
  arg2: any,
  arg3?: any,
  arg4?: any
) {
  let type = "info";
  let title = "";
  let message = "";
  let tipe: string | undefined;
  let pushBell = true;

  if (typeof arg2 === "object" && arg2 !== null) {
    type = arg2.type || "info";
    title = arg2.title || "";
    message = arg2.message || "";
    tipe = arg2.tipe;
    pushBell = arg2.pushBell ?? true;
  } else {
    type = arg2 || "info";
    if (arg4 !== undefined) {
      title = arg3 || "";
      message = arg4 || "";
    } else {
      message = arg3 || "";
    }
  }

  if (setToast && typeof setToast === "function") {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev: any) => (typeof prev === 'object' && prev !== null ? { ...prev, show: false } : { show: false }));
    }, 4500);
  }

  if (pushBell && type !== "error") {
    const resolvedTipe = tipe || ACTION_TO_TIPE[type] || "info";
    pushToNotificationBell({ tipe: resolvedTipe, message: title ? `${title}: ${message}` : message });
  }
}

export async function pushNotification({ tipe = 'info', message }: { tipe?: string; message: string }) {
  return pushToNotificationBell({ tipe, message });
}

export default notify;
