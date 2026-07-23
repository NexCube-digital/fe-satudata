"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
import { getDoctors } from "@/lib/doctorService";
import {
  Activity,
  Building2,
  Send,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Plus,
  ShieldCheck,
  Eye,
  ArrowRight,
  TrendingUp,
  Inbox
} from "lucide-react";

export default function FaskesRequests() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestsList, setRequestsList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New Request Form State
  const [nikInput, setNikInput] = useState("");
  const [poliInput, setPoliInput] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Search & registration states
  const [searchStatus, setSearchStatus] = useState("idle"); // "idle", "searching", "found", "not_found", "error"
  const [patientData, setPatientData] = useState(null);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerPob, setRegisterPob] = useState("");
  const [registerDob, setRegisterDob] = useState("");
  const [registerSex, setRegisterSex] = useState("laki-laki");
  const [registerBloodType, setRegisterBloodType] = useState("");
  const [registerEmergencyName, setRegisterEmergencyName] = useState("");
  const [registerEmergencyPhone, setRegisterEmergencyPhone] = useState("");

  const handleCheckNik = async () => {
    if (!nikInput || !/^\d{16}$/.test(nikInput)) {
      alert("NIK harus berupa 16 digit angka");
      return;
    }

    setSearchStatus("searching");
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/search-patient?nik=${nikInput}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        if (result.data?.found) {
          setSearchStatus("found");
          setPatientData(result.data.patient);
        } else {
          setSearchStatus("not_found");
          setPatientData(null);
          // Pre-populate register fields
          setRegisterName("");
          setRegisterEmail("");
          setRegisterPhone("");
          setRegisterAddress("");
          setRegisterPob("");
          setRegisterDob("");
          setRegisterSex("laki-laki");
          setRegisterBloodType("");
          setRegisterEmergencyName("");
          setRegisterEmergencyPhone("");
        }
      } else {
        setSearchStatus("error");
        alert(result.message || "Gagal mengecek NIK");
      }
    } catch (err) {
      console.error(err);
      setSearchStatus("error");
      alert("Terjadi kesalahan saat memeriksa NIK");
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchRequestsList();
    fetchDoctorsList();
    setLoading(false);
  }, []);

  const fetchDoctorsList = async () => {
    try {
      const res = await getDoctors();
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchRequestsList = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          patientName: item.patient?.name || "Pasien Terdaftar",
          nik: item.patient?.profil?.nik || "0000000000000000",
          walletAddress: item.patient?.wallet_address || "0x0000...0000",
          poli: item.requested_data || "Instalasi Medis",
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending Pasien" : item.status === "rejected" ? "Rejected" : "Revoked",
          txHash: item.tx_hash_response || item.tx_hash_request || "Menunggu Signature",
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.error("Error loading requests list:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!nikInput) return;

    if (searchStatus === "idle") {
      alert("Silakan klik 'Cek NIK' terlebih dahulu");
      return;
    }

    setSubmittingRequest(true);
    const token = localStorage.getItem("accessToken");
    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      if (searchStatus === "found") {
        // Normal Request Access Flow
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            patientNik: nikInput,
            jenisDataDiminta: `${poliInput} - ${purposeInput}`,
            txHash
          })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          fetchRequestsList();
          setNikInput("");
          setSearchStatus("idle");
          setPatientData(null);
          alert("Permintaan akses berhasil dikirim!");
        } else {
          alert(result.message || "Gagal membuat permohonan akses");
        }
      } else if (searchStatus === "not_found") {
        // Registration + Request Access Flow
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/create-patient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nik: nikInput,
            name: registerName,
            email: registerEmail,
            phone: registerPhone,
            address: registerAddress,
            place_of_birth: registerPob,
            date_of_birth: registerDob || null,
            sex: registerSex,
            blood_type: registerBloodType || null,
            emergency_contact_name: registerEmergencyName || null,
            emergency_contact_phone: registerEmergencyPhone || null,
            jenisDataDiminta: `${poliInput} - ${purposeInput}`,
            txHash
          })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          fetchRequestsList();
          setNikInput("");
          setSearchStatus("idle");
          alert("Pasien baru berhasil didaftarkan! Email aktivasi telah dikirim ke pasien. Status permohonan akses saat ini ditunda (pending) menunggu persetujuan pasien.");
        } else {
          alert(result.message || "Gagal mendaftarkan pasien baru");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirimkan permohonan");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredRequests = requestsList.filter((req) => {
    // Filter status
    if (filterStatus !== "all" && req.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    // Filter search query
    return (
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.poli.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-rose-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-800 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-rose-500/5 blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Activity className="h-8 w-8 text-rose-400" />
                Permintaan Akses Rekam Medis
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Ajukan permintaan otorisasi data medis baru ke alamat dompet blockchain pasien. Pantau status persetujuan dari pasien secara real-time.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Request Access Form */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="h-5 w-5 text-rose-800" />
                  Ajukan Izin Baru
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Kirim permintaan persetujuan ke pasien</p>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-4">
                 <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    NIK Pasien (16 Digit)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nikInput}
                      onChange={(e) => {
                        setNikInput(e.target.value.replace(/\D/g, ""));
                        setSearchStatus("idle");
                        setPatientData(null);
                      }}
                      placeholder="Masukkan NIK Pasien"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-mono focus:border-rose-800 focus:outline-hidden bg-slate-50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handleCheckNik}
                      disabled={nikInput.length !== 16 || searchStatus === "searching"}
                      className="rounded-xl border border-rose-800 text-rose-800 hover:bg-rose-50 px-4 py-2.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {searchStatus === "searching" ? "Mengecek..." : "Cek NIK"}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Masukkan NIK KTP pasien pemilik rekam medis.</p>
                </div>

                {searchStatus === "found" && patientData && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Pasien Ditemukan di Sistem
                    </p>
                    <p>Nama: <strong>{patientData.name}</strong></p>
                    <p>Status Akun: <strong>{patientData.statusAccount === "active" ? "Aktif" : "Menunggu Verifikasi Email"}</strong></p>
                  </div>
                )}

                {searchStatus === "not_found" && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 space-y-3">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      NIK Belum Terdaftar
                    </p>
                    <p>Isi data diri pasien di bawah ini untuk membuat akun pasien baru (aktivasi dikirim ke email pasien):</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="Nama Lengkap Pasien"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Email Pasien</label>
                        <input
                          type="email"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="emailpasien@example.com"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">No. Telepon</label>
                        <input
                          type="tel"
                          required
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          placeholder="0812xxxxxxxx"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Jenis Kelamin</label>
                        <select
                          value={registerSex}
                          onChange={(e) => setRegisterSex(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        >
                          <option value="laki-laki">Laki-laki</option>
                          <option value="perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          required
                          value={registerPob}
                          onChange={(e) => setRegisterPob(e.target.value)}
                          placeholder="Jakarta"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          required
                          value={registerDob}
                          onChange={(e) => setRegisterDob(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Golongan Darah</label>
                        <input
                          type="text"
                          value={registerBloodType}
                          onChange={(e) => setRegisterBloodType(e.target.value)}
                          placeholder="AB"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Alamat Lengkap</label>
                        <input
                          type="text"
                          required
                          value={registerAddress}
                          onChange={(e) => setRegisterAddress(e.target.value)}
                          placeholder="Alamat Lengkap KTP"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Nama Kontak Darurat</label>
                        <input
                          type="text"
                          value={registerEmergencyName}
                          onChange={(e) => setRegisterEmergencyName(e.target.value)}
                          placeholder="Hubungan: Ibu / Ayah"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">No. Kontak Darurat</label>
                        <input
                          type="tel"
                          value={registerEmergencyPhone}
                          onChange={(e) => setRegisterEmergencyPhone(e.target.value)}
                          placeholder="No HP Kontak Darurat"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {searchStatus !== "idle" && searchStatus !== "searching" && (
                  <>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pilih Dokter / Poli
                  </label>
                  {doctors.length === 0 ? (
                    <input
                      type="text"
                      value={poliInput}
                      onChange={(e) => setPoliInput(e.target.value)}
                      placeholder="Nama Poli / Dokter"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium focus:border-rose-800 focus:outline-hidden"
                      required
                    />
                  ) : (
                    <select
                      value={poliInput}
                      onChange={(e) => setPoliInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                      required
                    >
                      <option value="" disabled>-- Pilih Dokter / Poli --</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={`${d.specialist} - ${d.name}`}>
                          {d.specialist} - {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tujuan Pemeriksaan
                  </label>
                  <input
                    type="text"
                    required
                    value={purposeInput}
                    onChange={(e) => setPurposeInput(e.target.value)}
                    placeholder="Masukkan Tujuan Pemeriksaan"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-800 hover:bg-rose-700 px-6 py-3 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submittingRequest ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {searchStatus === "not_found" ? "Daftarkan Pasien & Kirim Permintaan Akses" : "Kirim Permintaan Akses"}
                </button>
                </>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
