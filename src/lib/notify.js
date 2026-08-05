
import { apiPost } from "@/lib/api";

/**
 * Mapping tipe aksi → tipe notifikasi backend
 */
const ACTION_TO_TIPE = {
  success: "info",
  error: "info",
  info: "info",
  rekam_medis_baru: "rekam_medis_baru",
  rekam_medis_diperbarui: "rekam_medis_diperbarui",
  permintaan_akses: "permintaan_akses",
  akses_disetujui: "akses_disetujui",
  akses_ditolak: "akses_ditolak",
  akses_dicabut: "akses_dicabut",
  reupload_blockchain: "reupload_blockchain",
  tambah_pasien: "tambah_pasien",
  tambah_dokter: "tambah_dokter",
  pos_transaksi: "pos_transaksi",
  penyerahan_resep: "penyerahan_resep",
};

/**
 * Kirim notifikasi ke bell notifikasi (backend) tanpa toast.
 * Setelah push, dispatch event "newNotification" agar Navbar langsung refresh.
 */
async function pushToNotificationBell({ tipe = "info", message }) {
  try {
    await apiPost("/api/notifications/push", { tipe, message });
    window.dispatchEvent(new Event("newNotification"));
  } catch (err) {
    // Gagal push ke bell tidak harus mengganggu UX
    console.warn("Gagal push notifikasi ke bell:", err?.message);
  }
}

/**
 * Tampilkan toast floating dan sekaligus push ke bell notifikasi Navbar.
 *
 * @param {Function} setToast - state setter dari useState({ show, type, title, message })
 * @param {{ type: 'success'|'error'|'info', title?: string, message: string, tipe?: string, pushBell?: boolean }} opts
 */
export function notify(setToast, { type = "info", title, message, tipe, pushBell = true }) {
  // 1. Tampilkan toast floating
  setToast({ show: true, type, title, message });
  setTimeout(() => setToast({ show: false }), 4500);

  // 2. Push ke bell notifikasi jika diminta (default: ya, kecuali error)
  if (pushBell && type !== "error") {
    const resolvedTipe = tipe || ACTION_TO_TIPE[type] || "info";
    pushToNotificationBell({ tipe: resolvedTipe, message: title ? `${title}: ${message}` : message });
  }
}

/**
 * Versi singleton: jika tidak ada setToast,
 * cukup push ke bell saja (tanpa toast visual).
 */
export async function pushNotification({ tipe = "info", message }) {
  return pushToNotificationBell({ tipe, message });
}

export default notify;
