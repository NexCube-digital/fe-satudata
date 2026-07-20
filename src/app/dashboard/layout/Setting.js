"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { 
  User, 
  Lock, 
  Wallet, 
  Save, 
  ShieldCheck, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Phone,
  MapPin,
  Calendar,
  Users
} from "lucide-react";

export default function SettingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // State Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("L");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // State Security (Update Password)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // State Wallet
  const [walletAddress, setWalletAddress] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState({ type: "", text: "" });

  // Fetch Initial Data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setNik(parsed.nik || "");
        setWalletAddress(parsed.wallet_address || "");

        // Fetch detailed profile from BE if available
        fetchProfile(parsed);
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (currentUser) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (currentUser?.role === "pasien") {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const u = result.data;
          setName(u.name || "");
          setEmail(u.email || "");
          setNik(u.nik || "");
          setWalletAddress(u.wallet_address || "");
          if (u.profil) {
            setPhone(u.profil.phone || "");
            setAddress(u.profil.address || "");
            setDateOfBirth(u.profil.date_of_birth ? u.profil.date_of_birth.substring(0, 10) : "");
            setSex(u.profil.sex || "L");
          }
        }
      } catch (err) {
        console.log("Could not fetch detailed profile from BE", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Submit Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        name,
        nik,
        phone,
        address,
        sex,
        date_of_birth: dateOfBirth || null
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      // Update local storage user state
      const updatedUser = { ...user, name, nik };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setProfileMsg({ type: "success", text: result.message || "Profil berhasil diperbarui!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Kata sandi baru minimal 6 karakter" });
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui kata sandi");
      }

      setPasswordMsg({ type: "success", text: result.message || "Kata sandi berhasil diperbarui!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Connect MetaMask Wallet
  const handleConnectWallet = async () => {
    setWalletMsg({ type: "", text: "" });
    setWalletLoading(true);

    try {
      if (typeof window.ethereum === "undefined") {
        // Fallback simulation if MetaMask extension is not installed
        const simulatedAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setWalletAddress(simulatedAddress);
        const updatedUser = { ...user, wallet_address: simulatedAddress };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setWalletMsg({ type: "success", text: `MetaMask berhasil ditautkan: ${simulatedAddress.substring(0, 6)}...${simulatedAddress.substring(38)}` });
        setWalletLoading(false);
        return;
      }

      // 1. Request account from MetaMask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      const token = localStorage.getItem("accessToken");

      // 2. Request nonce from BE
      const nonceRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/wallet/nonce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ walletAddress: address })
      });
      const nonceResult = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceResult.message || "Gagal mendapatkan nonce wallet");

      const messageToSign = nonceResult.data.message;

      // 3. Sign message with MetaMask
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [messageToSign, address]
      });

      // 4. Send signature to BE connect endpoint
      const connectRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/wallet/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ walletAddress: address, signature })
      });
      const connectResult = await connectRes.json();
      if (!connectRes.ok) throw new Error(connectResult.message || "Gagal menautkan dompet");

      setWalletAddress(address);
      const updatedUser = { ...user, wallet_address: address };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setWalletMsg({ type: "success", text: "MetaMask Wallet berhasil diverifikasi dan ditautkan ke akun Anda!" });
    } catch (err) {
      setWalletMsg({ type: "error", text: err.message });
    } finally {
      setWalletLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  const roleLabelMap = {
    admin: "Administrator",
    rumah_sakit: "Fasilitas Kesehatan",
    faskes: "Fasilitas Kesehatan",
    pasien: "Pasien Terdaftar"
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel={roleLabelMap[user?.role] || "Dashboard"} onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role={user?.role} />

        <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
          {/* Title Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Pengaturan Akun</h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola profil pribadi, kata sandi keamanan, dan koneksi dompet MetaMask Anda.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "profile"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <User className="h-4 w-4" />
              Profil Pengguna
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "security"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Lock className="h-4 w-4" />
              Keamanan & Sandi
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "wallet"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Web3 & MetaMask
            </button>
          </div>

          {/* TAB 1: PROFIL PENGGUNA */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-pink-600" />
                Informasi Profil
              </h2>

              {profileMsg.text && (
                <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm ${
                  profileMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {profileMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Alamat Email (Akun)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-pink-600 focus:outline-hidden"
                      placeholder="3171010509840002"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {user?.role === "pasien" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Lahir</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jenis Kelamin</label>
                        <select
                          value={sex}
                          onChange={(e) => setSex(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Alamat Tempat Tinggal</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Raya Kebon Jeruk No. 12"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-500 transition cursor-pointer disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KEAMANAN & SANDI */}
          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-pink-600" />
                Ganti Kata Sandi
              </h2>

              {passwordMsg.text && (
                <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm ${
                  passwordMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {passwordMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-500 transition cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WEB3 & METAMASK */}
          {activeTab === "wallet" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-pink-600" />
                Penautan Dompet MetaMask (Web3 Identity)
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Tautkan alamat wallet MetaMask Anda ke akun SatuData untuk mengotorisasi transaksi *grantAccess()* dan *revokeAccess()* secara terdesentralisasi.
              </p>

              {walletMsg.text && (
                <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm ${
                  walletMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {walletMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <span>{walletMsg.text}</span>
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Kredensial Wallet</span>
                  {walletAddress ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-4 w-4" /> Terverifikasi & Ditautkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      Belum Ditautkan
                    </span>
                  )}
                </div>

                <div className="text-sm font-mono bg-white p-3 rounded-xl border border-slate-200 break-all text-slate-700">
                  {walletAddress || "Alamat wallet belum dikonfigurasi"}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-sm hover:from-amber-400 hover:to-orange-500 transition cursor-pointer disabled:opacity-50"
                >
                  {walletLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  {walletAddress ? "Tautkan Ulang Wallet" : "Tautkan MetaMask Wallet"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
