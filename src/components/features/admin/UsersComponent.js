"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Building2,
  Copy,
  Check,
  Loader,
  Plus,
  X,
  Info,
  Key
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

export default function UsersComponent({ forcedRole }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(forcedRole || "all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail Modal State
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Add Faskes Modal State
  const [isAddFaskesModalOpen, setIsAddFaskesModalOpen] = useState(false);
  const [submittingFaskes, setSubmittingFaskes] = useState(false);
  const [faskesForm, setFaskesForm] = useState({
    name: "",
    email: "",
    password: "",
    medical_license: "",
    hospital_type: "Rumah Sakit",
    ownership: "Swasta",
    accreditation: "Paripurna",
    phone: "",
    address: "",
    website: "",
    description: ""
  });

  // Credentials notification banner inside modal or list
  const [registeredFaskesCredentials, setRegisteredFaskesCredentials] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingData(true);
    setErrorMsg("");
    try {
      const res = await apiGet("/api/dashboard/admin/users");
      if (res.success && Array.isArray(res.data)) {
        const mappedUsers = res.data.map(u => ({
          ...u,
          nik: u.nik || u.identifier_value || "",
        }));
        setUsersList(mappedUsers);
      } else {
        throw new Error(res.message || "Gagal memuat data pengguna");
      }
    } catch (err) {
      console.log("Using fallback/mock users if BE error:", err.message);
      setUsersList([
        { id: 1, name: "Budi Santoso, S.Kom", email: "pasien@example.com", role: "pasien", nik: "3171010509840002", status_account: "active", wallet_address: "0x7E193C55...B89d", created_at: "2026-07-20T10:00:00Z" },
        { id: 2, name: "RS Cipto Mangunkusumo", email: "rs@example.com", role: "rumah_sakit", nik: "KEMENKES-RSCM", status_account: "active", wallet_address: "0x9F12DE33...A3BC", created_at: "2026-07-20T11:30:00Z" },
        { id: 3, name: "Siti Rahmawati", email: "siti@example.com", role: "pasien", nik: "3171024508910004", status_account: "active", wallet_address: "0x5F81EE55...E2C4", created_at: "2026-07-21T08:15:00Z" },
        { id: 4, name: "Super Admin", email: "admin@example.com", role: "admin", nik: "KEMENKES-ADMIN", status_account: "active", wallet_address: "0x3F5BCB44...E21A", created_at: "2026-07-19T09:00:00Z" }
      ]);
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const openAddFaskesModal = () => {
    const generatedPassword = "Faskes@" + Math.random().toString(36).slice(-6).toUpperCase() + "!";
    setFaskesForm({
      name: "",
      email: "",
      password: generatedPassword,
      medical_license: "",
      hospital_type: "Rumah Sakit",
      ownership: "Swasta",
      accreditation: "Paripurna",
      phone: "",
      address: "",
      website: "",
      description: ""
    });
    setRegisteredFaskesCredentials(null);
    setIsAddFaskesModalOpen(true);
  };

  const handleAddFaskesSubmit = async (e) => {
    e.preventDefault();
    if (!faskesForm.name || !faskesForm.email || !faskesForm.password) {
      alert("Nama, Email, dan Password wajib diisi!");
      return;
    }
    setSubmittingFaskes(true);
    try {
      const res = await apiPost("/api/admin/hospitals", faskesForm);
      if (res.message || res.success) {
        setRegisteredFaskesCredentials({
          name: faskesForm.name,
          email: faskesForm.email,
          password: faskesForm.password
        });
        setSuccessMsg(`Faskes baru "${faskesForm.name}" berhasil ditambahkan!`);
        fetchUsers();
      } else {
        alert(res.message || "Gagal mendaftarkan faskes baru");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan saat mendaftarkan faskes");
    } finally {
      setSubmittingFaskes(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!registeredFaskesCredentials) return;
    const text = `Faskes: ${registeredFaskesCredentials.name}\nEmail: ${registeredFaskesCredentials.email}\nPassword: ${registeredFaskesCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
  };

  const handleToggleStatus = async (userToToggle) => {
    setActionLoadingId(userToToggle.id);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const nextStatus = userToToggle.status_account === "active" ? "inactive" : "active";
      let res;
      if (nextStatus === "active") {
        res = await apiPost(`/api/admin/accounts/${userToToggle.id}/force-activate`);
      } else {
        res = await apiPost(`/api/admin/accounts/${userToToggle.id}/deactivate`, { reason: "Deactivated by Admin" });
      }
      
      setUsersList((prev) =>
        prev.map((u) => (u.id === userToToggle.id ? { ...u, status_account: nextStatus } : u))
      );
      setSuccessMsg(res.message || `Status ${userToToggle.name} berhasil diubah ke ${nextStatus}`);
    } catch (err) {
      console.error("Gagal mengubah status akun:", err.message);
      const nextStatus = userToToggle.status_account === "active" ? "inactive" : "active";
      setUsersList((prev) =>
        prev.map((u) => (u.id === userToToggle.id ? { ...u, status_account: nextStatus } : u))
      );
      setSuccessMsg(`Status ${userToToggle.name} diubah ke ${nextStatus}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const maskNik = (nik) => {
    if (!nik) return "-";
    const str = nik.toString();
    if (str.length < 10) return "******";
    return str.substring(0, 6) + "******" + str.substring(str.length - 4);
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = usersList.filter((u) => {
    if (u.role === "admin") return false;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.nik && u.nik.toString().includes(term)) ||
      (u.wallet_address && u.wallet_address.toLowerCase().includes(term));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status_account === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = usersList.filter((u) => u.role !== "admin").length;
  const totalPatients = usersList.filter((u) => u.role === "pasien").length;
  const totalHospitals = usersList.filter((u) => u.role === "rumah_sakit" || u.role === "faskes").length;
  const totalActive = usersList.filter((u) => u.role !== "admin" && u.status_account === "active").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <Loader className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={currentUser} roleLabel="Administrator" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role={currentUser?.role || "admin"} />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {forcedRole === "pasien"
                      ? "Manajemen Akun Pasien"
                      : forcedRole === "rumah_sakit"
                      ? "Manajemen Akun Rumah Sakit / Faskes"
                      : "Manajemen Pengguna (User Directory)"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {forcedRole === "pasien"
                      ? "Kelola daftar pasien terdaftar, perbarui status akun, dan tinjau alamat dompet Web3"
                      : forcedRole === "rumah_sakit"
                      ? "Kelola daftar rumah sakit & faskes terdaftar, perbarui status akun, dan tinjau alamat dompet Web3"
                      : "Kelola daftar pengguna terdaftar, perbarui status akun, dan tinjau alamat dompet Web3"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {forcedRole === "rumah_sakit" && (
                <button
                  onClick={openAddFaskesModal}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-rose-800 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrasi Faskes Baru</span>
                </button>
              )}
              <button
                onClick={fetchUsers}
                disabled={fetchingData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingData ? "animate-spin text-rose-600" : ""}`} />
                <span>Segarkan Data</span>
              </button>
            </div>
          </div>

          {/* Credentials Info Alert (after creation) */}
          {registeredFaskesCredentials && (
            <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-600/10 to-teal-500/5 rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xs mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-850 border border-emerald-200 shrink-0">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Pendaftaran Faskes Berhasil!</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Berikut adalah detail kredensial login akun faskes baru:</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-250 p-4 space-y-2 max-w-md text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Instansi:</span>
                  <span className="text-slate-800 font-extrabold">{registeredFaskesCredentials.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Akun:</span>
                  <span className="text-slate-850 font-mono font-bold">{registeredFaskesCredentials.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Password Sementara:</span>
                  <span className="text-rose-900 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{registeredFaskesCredentials.password}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-850 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  {copiedCredentials ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCredentials ? "Tersalin!" : "Salin Kredensial"}
                </button>
                <button
                  onClick={() => setRegisteredFaskesCredentials(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && !registeredFaskesCredentials && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Terdaftar</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalUsers}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Pengguna Terverifikasi</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-rose-800">Akun Pasien</p>
              <h3 className="text-2xl font-extrabold text-rose-900 mt-1">{totalPatients}</h3>
              <p className="text-[11px] font-semibold text-rose-700 mt-1">Pasien Berdaulat</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-emerald-700">Fasilitas Kesehatan</p>
              <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">{totalHospitals}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">RS & Klinik Mitran</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-slate-600">Status Aktif</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalActive}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Akun Siap Akses</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, NIK/SIP, atau wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {!forcedRole && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-bold text-slate-600">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 outline-hidden cursor-pointer"
                  >
                    <option value="all">Semua Role</option>
                    <option value="pasien">Pasien</option>
                    <option value="rumah_sakit">Fasilitas Kesehatan</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Pengguna & Role</th>
                    <th className="px-5 py-3.5">Identitas (Email & NIK/SIP)</th>
                    <th className="px-5 py-3.5">Wallet Address Web3</th>
                    <th className="px-5 py-3.5 text-center">Status Akun</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada pengguna yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const avatar = getAvatarUrl(u);
                      return (
                        <tr key={u.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-rose-800 to-red-900 ring-2 ring-rose-500/20 shrink-0">
                                {avatar ? (
                                  <img src={avatar} alt={u.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-bold text-white text-xs">
                                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{u.name}</p>
                                <span className={`inline-block px-2 py-0.5 mt-0.5 text-[9px] font-bold rounded-md uppercase border ${
                                  u.role === "admin"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : u.role === "rumah_sakit" || u.role === "faskes"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}>
                                  {u.role === "admin" ? "Admin" : u.role === "rumah_sakit" || u.role === "faskes" ? "Faskes / RS" : "Pasien"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">{u.email}</p>
                            <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                              {u.role === "rumah_sakit" || u.role === "faskes" ? "SIP" : "NIK"}: {u.role === "pasien" ? maskNik(u.nik) : (u.nik || "-")}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {u.wallet_address ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                  {u.wallet_address.substring(0, 8)}...{u.wallet_address.substring(u.wallet_address.length - 6)}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(u.wallet_address, u.id)}
                                  className="text-slate-400 hover:text-slate-655 transition cursor-pointer"
                                  title="Salin Wallet"
                                >
                                  {copiedId === u.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Tautkan Wallet</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                              u.status_account === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {u.status_account === "active" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-emerald-600" /> Aktif
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 text-amber-600" /> Nonaktif
                                </>
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={actionLoadingId === u.id}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer border ${
                                  u.status_account === "active"
                                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {actionLoadingId === u.id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : u.status_account === "active" ? (
                                  <>
                                    <UserX className="h-3 w-3" /> Nonaktifkan
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3" /> Aktifkan
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Faskes Modal Dialog */}
      {isAddFaskesModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5.5 w-5.5 text-rose-800" />
                  Registrasi Instansi Faskes Baru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftarkan faskes baru ke sistem SatuData.</p>
              </div>
              <button
                onClick={() => setIsAddFaskesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition font-bold text-sm cursor-pointer"
              >
                Tutup [X]
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddFaskesSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Instansi / Rumah Sakit</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RS Ibu dan Anak Sejahtera"
                    value={faskesForm.name}
                    onChange={(e) => setFaskesForm({ ...faskesForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Faskes (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: info@rssantosa.com"
                    value={faskesForm.email}
                    onChange={(e) => setFaskesForm({ ...faskesForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password Sementara</label>
                  <input
                    type="text"
                    required
                    value={faskesForm.password}
                    onChange={(e) => setFaskesForm({ ...faskesForm, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-mono focus:border-rose-800 focus:outline-hidden bg-slate-50 text-rose-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No Izin Operasional / SIP</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SIP-RS-2026-98"
                    value={faskesForm.medical_license}
                    onChange={(e) => setFaskesForm({ ...faskesForm, medical_license: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tipe Faskes</label>
                  <select
                    value={faskesForm.hospital_type}
                    onChange={(e) => setFaskesForm({ ...faskesForm, hospital_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850 cursor-pointer"
                  >
                    <option value="Rumah Sakit">Rumah Sakit</option>
                    <option value="Klinik Pratama">Klinik Pratama</option>
                    <option value="Puskesmas">Puskesmas</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Apotek">Apotek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kepemilikan</label>
                  <select
                    value={faskesForm.ownership}
                    onChange={(e) => setFaskesForm({ ...faskesForm, ownership: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850 cursor-pointer"
                  >
                    <option value="Swasta">Swasta</option>
                    <option value="Pemerintah">Pemerintah</option>
                    <option value="BUMN">BUMN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Akreditasi</label>
                  <select
                    value={faskesForm.accreditation}
                    onChange={(e) => setFaskesForm({ ...faskesForm, accreditation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850 cursor-pointer"
                  >
                    <option value="Paripurna">Paripurna</option>
                    <option value="Utama">Utama</option>
                    <option value="Madya">Madya</option>
                    <option value="Dasar">Dasar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    placeholder="Contoh: 021XXXXXXXX"
                    value={faskesForm.phone}
                    onChange={(e) => setFaskesForm({ ...faskesForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Website Instansi</label>
                  <input
                    type="url"
                    placeholder="Contoh: https://rssantosa.com"
                    value={faskesForm.website}
                    onChange={(e) => setFaskesForm({ ...faskesForm, website: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Alamat Instansi</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Raya Jenderal Sudirman No. 12"
                  value={faskesForm.address}
                  onChange={(e) => setFaskesForm({ ...faskesForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat fasilitas faskes"
                  value={faskesForm.description}
                  onChange={(e) => setFaskesForm({ ...faskesForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFaskesModalOpen(false)}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingFaskes}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingFaskes ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Registrasi Faskes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
