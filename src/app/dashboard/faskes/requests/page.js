"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDoctors } from "@/services/doctorService";
import {
  Activity,
  Building2,
  Send,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserPlus,
  Info,
  Key,
  Copy,
  Check
} from "lucide-react";

export default function FaskesRequests() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  // Form states
  const [nikInput, setNikInput] = useState("");
  const [poliInput, setPoliInput] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Search status: "idle", "searching", "found", "not_found", "error"
  const [searchStatus, setSearchStatus] = useState("idle");
  const [patientData, setPatientData] = useState(null);

  // Registration Form States (shown if NIK not found)
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

  // Credentials notification popup state
  const [showCredentialsBanner, setShowCredentialsBanner] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleCheckNik = async () => {
    if (!nikInput || !/^\d{16}$/.test(nikInput)) {
      alert("NIK harus berupa 16 digit angka");
      return;
    }

    setSearchStatus("searching");
    setPatientData(null);
    setShowCredentialsBanner(false);
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient?nik=${nikInput}`, {
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
          // Reset registration inputs
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
        alert(result.message || "Gagal memeriksa status NIK");
      }
    } catch (err) {
      console.error(err);
      setSearchStatus("error");
      alert("Terjadi kesalahan koneksi saat memeriksa NIK");
    }
  };

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "SatuData@";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + "!";
  };

  const handleCopyCredentials = () => {
    if (!generatedCredentials) return;
    const text = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!nikInput) return;

    if (searchStatus === "idle" || searchStatus === "searching") {
      alert("Silakan periksa NIK terlebih dahulu");
      return;
    }

    setSubmittingRequest(true);
    const token = localStorage.getItem("accessToken");
    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      if (searchStatus === "found") {
        // Option A: Patient exists, request access directly
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
          alert("Permintaan akses rekam medis berhasil dikirim ke portal pasien!");
          setNikInput("");
          setPoliInput("");
          setPurposeInput("");
          setSearchStatus("idle");
          setPatientData(null);
        } else {
          alert(result.message || "Gagal membuat permohonan akses");
        }
      } else if (searchStatus === "not_found") {
        // Option B: Patient doesn't exist, register them first, then request access
        const generatedPassword = generateSecurePassword();

        // 1. Submit Registration
        const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nik: nikInput,
            name: registerName,
            email: registerEmail,
            password: generatedPassword,
            place_of_birth: registerPob,
            date_of_birth: registerDob || null,
            sex: registerSex,
            address: registerAddress,
            phone: registerPhone,
            blood_type: registerBloodType || null,
            emergency_contact_name: registerEmergencyName || null,
            emergency_contact_phone: registerEmergencyPhone || null
          })
        });
        const regResult = await regRes.json();

        if (!regRes.ok || !regResult.success) {
          alert(regResult.message || "Gagal mendaftarkan pasien baru");
          setSubmittingRequest(false);
          return;
        }

        // 2. Submit Request Access
        const reqRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
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
        const reqResult = await reqRes.json();

        if (reqRes.ok && reqResult.success) {
          // Store generated credentials for display/print
          setGeneratedCredentials({
            name: registerName,
            email: registerEmail,
            password: generatedPassword
          });
          setShowCredentialsBanner(true);

          alert("Pasien baru berhasil didaftarkan dan permintaan akses rekam medis telah dikirim!");
          
          // Clear inputs
          setPoliInput("");
          setPurposeInput("");
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
          setSearchStatus("idle");
          setPatientData(null);
        } else {
          alert(reqResult.message || "Registrasi berhasil, tetapi gagal mengirim permintaan akses.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem dalam mengirimkan permohonan");
    } finally {
      setSubmittingRequest(false);
    }
  };

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
          <button onClick={() => router.push("/auth/login")} className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-850 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </button>
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
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-rose-700/10 blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-rose-400" />
                Tambah & Request Akses Pasien
              </h1>
              <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
                Gunakan NIK KTP untuk memeriksa data pasien. Daftarkan pasien baru secara instan jika belum terdaftar, atau ajukan permintaan akses EHR blockchain jika akun sudah aktif.
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Credentials Banner Notification */}
            {showCredentialsBanner && generatedCredentials && (
              <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-600/10 to-teal-500/5 rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xs animate-fade-in space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-250 shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Akun Pasien Baru Berhasil Dibuat!</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Berikut adalah detail kredensial sementara pasien. Silakan salin untuk diberikan kepada pasien.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-200/60 p-4 space-y-2.5 max-w-md">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Nama Pasien:</span>
                    <span className="text-slate-800 font-extrabold">{generatedCredentials.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Email Akun:</span>
                    <span className="text-slate-800 font-mono font-bold">{generatedCredentials.email}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Password Sementara:</span>
                    <span className="text-rose-900 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/50">{generatedCredentials.password}</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-850 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Tersalin!" : "Salin Kredensial"}
                  </button>
                  <button
                    onClick={() => setShowCredentialsBanner(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                  >
                    Tutup Notifikasi
                  </button>
                </div>
              </div>
            )}

            {/* Check NIK Form */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-800" />
                  Identifikasi NIK Pasien
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Lakukan pengecekan NIK pasien pada sistem SatuData</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={16}
                      value={nikInput}
                      onChange={(e) => {
                        setNikInput(e.target.value.replace(/\D/g, ""));
                        setSearchStatus("idle");
                        setPatientData(null);
                      }}
                      placeholder="Masukkan 16 digit NIK"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-mono focus:border-rose-800 focus:outline-hidden bg-slate-50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handleCheckNik}
                      disabled={nikInput.length !== 16 || searchStatus === "searching"}
                      className="rounded-xl border border-rose-800 text-rose-800 hover:bg-rose-50 px-5 py-2.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      {searchStatus === "searching" ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Cek NIK"
                      )}
                    </button>
                  </div>
                </div>

                {/* Notifications & Result banners */}
                {searchStatus === "found" && patientData && (
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-500/20 p-4 text-xs text-emerald-800 space-y-2 animate-fade-in shadow-2xs">
                    <p className="font-bold flex items-center gap-1.5 text-[13px]">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      Pasien Terdaftar Ditemukan
                    </p>
                    <p className="text-slate-650">Pasien atas nama <strong className="text-slate-800">{patientData.name}</strong> dengan NIK {nikInput} terdaftar aktif di SatuData. Silakan isi form di bawah untuk meminta akses rekam medis.</p>
                  </div>
                )}

                {searchStatus === "not_found" && (
                  <div className="rounded-2xl bg-amber-50/70 border-2 border-amber-500/20 p-4 text-xs text-amber-900 space-y-2 animate-fade-in shadow-2xs">
                    <p className="font-bold flex items-center gap-1.5 text-[13px]">
                      <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
                      NIK Belum Terdaftar
                    </p>
                    <p className="text-slate-650">NIK {nikInput} belum terdaftar di SatuData. Silakan isi form pembuatan akun pasien baru di bawah. Sistem akan mendaftarkan pasien sekaligus mengirimkan pengajuan izin akses.</p>
                  </div>
                )}

                {searchStatus === "error" && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Terjadi kesalahan saat memeriksa database. Coba lagi atau hubungi administrator.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form details input */}
            {searchStatus !== "idle" && searchStatus !== "searching" && (
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs animate-fade-in">
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    {searchStatus === "not_found" ? (
                      <>
                        <UserPlus className="h-5 w-5 text-rose-800" />
                        Form Pendaftaran Pasien Baru
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 text-rose-800" />
                        Form Request Akses Medis
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchStatus === "not_found"
                      ? "Lengkapi formulir pendaftaran di bawah ini"
                      : "Lengkapi data permohonan akses data medis"}
                  </p>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-5">
                  {/* Option A: Registration Fields (only visible if NIK not found) */}
                  {searchStatus === "not_found" && (
                    <div className="space-y-4 bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-200/60">
                      <h4 className="text-xs font-extrabold text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                        <Info className="h-4 w-4 text-rose-850" />
                        Informasi Biodata Pasien
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Nama Lengkap Pasien</label>
                          <input
                            type="text"
                            required
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            placeholder="Sesuai KTP"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Alamat Email Aktif</label>
                          <input
                            type="email"
                            required
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            placeholder="emailpasien@example.com"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Nomor Telepon</label>
                          <input
                            type="tel"
                            required
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            placeholder="0812xxxxxxxx"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Jenis Kelamin</label>
                          <select
                            value={registerSex}
                            onChange={(e) => setRegisterSex(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          >
                            <option value="laki-laki">Laki-laki</option>
                            <option value="perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Tempat Lahir</label>
                          <input
                            type="text"
                            required
                            value={registerPob}
                            onChange={(e) => setRegisterPob(e.target.value)}
                            placeholder="Kota Kelahiran"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Tanggal Lahir</label>
                          <input
                            type="date"
                            required
                            value={registerDob}
                            onChange={(e) => setRegisterDob(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Golongan Darah</label>
                          <input
                            type="text"
                            value={registerBloodType}
                            onChange={(e) => setRegisterBloodType(e.target.value)}
                            placeholder="Contoh: A / B / O / AB"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Alamat Domisili KTP</label>
                          <input
                            type="text"
                            required
                            value={registerAddress}
                            onChange={(e) => setRegisterAddress(e.target.value)}
                            placeholder="Alamat lengkap beserta RT/RW"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Hubungan Kontak Darurat</label>
                          <input
                            type="text"
                            value={registerEmergencyName}
                            onChange={(e) => setRegisterEmergencyName(e.target.value)}
                            placeholder="Contoh: Ayah / Ibu / Istri"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">No HP Kontak Darurat</label>
                          <input
                            type="tel"
                            value={registerEmergencyPhone}
                            onChange={(e) => setRegisterEmergencyPhone(e.target.value)}
                            placeholder="08xxxxxxxx"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option B: Standard Request Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Pilih Dokter Penanggung Jawab / Poli
                      </label>
                      {doctors.length === 0 ? (
                        <input
                          type="text"
                          required
                          value={poliInput}
                          onChange={(e) => setPoliInput(e.target.value)}
                          placeholder="Masukkan unit poliklinik / nama dokter"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium focus:border-rose-800 focus:outline-hidden bg-white"
                        />
                      ) : (
                        <select
                          value={poliInput}
                          onChange={(e) => setPoliInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white cursor-pointer"
                          required
                        >
                          <option value="" disabled>-- Pilih Dokter / Poli Faskes --</option>
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
                        Tujuan Pemeriksaan Medis
                      </label>
                      <input
                        type="text"
                        required
                        value={purposeInput}
                        onChange={(e) => setPurposeInput(e.target.value)}
                        placeholder="Contoh: Pemeriksaan Jantung Rutin / Rujukan Rawat Inap"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-slate-50 focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-800 hover:bg-rose-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingRequest ? (
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {searchStatus === "not_found"
                        ? "Daftarkan Pasien & Ajukan Akses Medis"
                        : "Kirim Permintaan Otorisasi"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
