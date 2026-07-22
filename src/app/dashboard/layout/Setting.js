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
  Users,
  Camera,
  Edit3,
  Unlock
} from "lucide-react";
import { getAvatarUrl } from "@/lib/api";

export default function SettingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // State Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [isNikFilledOnLoad, setIsNikFilledOnLoad] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("L");
  const [statusAccount, setStatusAccount] = useState("active");
  const [resendLoading, setResendLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Custom Date Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // Initial states to track changes
  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialAddress, setInitialAddress] = useState("");
  const [initialDateOfBirth, setInitialDateOfBirth] = useState("");
  const [initialSex, setInitialSex] = useState("L");
  const [initialNik, setInitialNik] = useState("");

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/resend-activation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: result.message || "Email verifikasi / aktivasi berhasil dikirim ulang!" });
      } else {
        throw new Error(result.message || "Gagal mengirim email verifikasi");
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setResendLoading(false);
    }
  };

  // State Profile Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  const isFieldEditable = (field) => {
    if (field === "nik" && isNikFilledOnLoad) return false;
    return isEditMode;
  };

  const hasChanges = 
    name !== initialName ||
    phone !== initialPhone ||
    address !== initialAddress ||
    (user?.role === "pasien" && (
      dateOfBirth !== initialDateOfBirth ||
      sex !== initialSex ||
      (!isNikFilledOnLoad && nik !== initialNik)
    )) ||
    profilePictureFile !== null;

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setName(initialName);
    setPhone(initialPhone);
    setAddress(initialAddress);
    setDateOfBirth(initialDateOfBirth);
    setSex(initialSex);
    setNik(initialNik);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

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
        setInitialName(parsed.name || "");
        setEmail(parsed.email || "");
        const localNik = parsed.nik || parsed.medical_license || "";
        setNik(localNik);
        setInitialNik(localNik);
        if (localNik) {
          setIsNikFilledOnLoad(true);
        }
        setWalletAddress(parsed.wallet_address || "");

        // Fetch detailed profile from BE if available
        fetchProfile(parsed);
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (dateOfBirth) {
      const parsed = new Date(dateOfBirth);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [dateOfBirth]);

  const fetchProfile = async (currentUser) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const isHospital = currentUser?.role === "rumah_sakit" || currentUser?.role === "faskes";
    const endpoint = isHospital
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/profile`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/profile`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const u = result.data;
        setName(u.name || "");
        setInitialName(u.name || "");
        setEmail(u.email || "");
        const finalNik = u.nik || u.profil?.nik || u.hospitalProfile?.medical_license || "";
        setNik(finalNik);
        setInitialNik(finalNik);
        if (finalNik) {
          setIsNikFilledOnLoad(true);
        }
        setStatusAccount(u.status_account || currentUser?.status_account || "active");
        setWalletAddress(u.wallet_address || "");

        if (u.profil) {
          const pPhone = u.profil.phone || "";
          setPhone(pPhone);
          setInitialPhone(pPhone);
          
          const pAddress = u.profil.address || "";
          setAddress(pAddress);
          setInitialAddress(pAddress);
          
          const pDob = u.profil.date_of_birth ? u.profil.date_of_birth.substring(0, 10) : "";
          setDateOfBirth(pDob);
          setInitialDateOfBirth(pDob);
          
          const pSex = u.profil.sex || "L";
          setSex(pSex);
          setInitialSex(pSex);
        } else if (u.hospitalProfile) {
          const hPhone = u.hospitalProfile.phone || "";
          setPhone(hPhone);
          setInitialPhone(hPhone);
          
          const hAddress = u.hospitalProfile.address || "";
          setAddress(hAddress);
          setInitialAddress(hAddress);
        }

        const computedAvatar = getAvatarUrl(u);
        const updatedUser = {
          ...(currentUser || {}),
          ...u,
          avatarUrl: computedAvatar || getAvatarUrl(currentUser),
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.log("Could not fetch detailed profile from BE", err);
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
      const isHospital = user?.role === "rumah_sakit" || user?.role === "faskes";
      const endpoint = isHospital
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/profile`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/profile`;

      let bodyData;
      let headers = { Authorization: `Bearer ${token}` };

      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("name", name);
        if (nik) {
          if (isHospital) {
            formData.append("medical_license", nik);
          } else {
            formData.append("nik", nik);
          }
        }
        if (phone) formData.append("phone", phone);
        if (address) formData.append("address", address);
        if (sex && !isHospital) formData.append("sex", sex);
        if (dateOfBirth && !isHospital) formData.append("date_of_birth", dateOfBirth);

        if (isHospital) {
          formData.append("logo", profilePictureFile);
        } else {
          formData.append("profile_picture", profilePictureFile);
        }

        bodyData = formData;
      } else {
        headers["Content-Type"] = "application/json";
        const payload = {
          name,
          phone,
          address,
        };
        if (isHospital) {
          payload.medical_license = nik;
        } else {
          payload.nik = nik;
          payload.sex = sex;
          payload.date_of_birth = dateOfBirth || null;
        }
        bodyData = JSON.stringify(payload);
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers,
        body: bodyData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      const updatedProfileData = result.data || {};
      const computedAvatar = getAvatarUrl(updatedProfileData) || profilePicturePreview;

      const updatedUser = {
        ...user,
        ...updatedProfileData,
        name,
        nik,
        medical_license: isHospital ? nik : undefined,
        avatarUrl: computedAvatar || user?.avatarUrl,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
      setInitialName(name);
      setInitialPhone(phone);
      setInitialAddress(address);
      setInitialDateOfBirth(dateOfBirth);
      setInitialSex(sex);
      setInitialNik(nik);
      if (nik) {
        setIsNikFilledOnLoad(true);
      }
      setProfilePictureFile(null);
      setIsEditMode(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-600" />
                  Informasi Profil
                </h2>
              </div>

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
                {/* Profile Picture Upload Box */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-800 to-red-900 ring-4 ring-rose-500/20 shrink-0 shadow-md">
                    {profilePicturePreview || getAvatarUrl(user) ? (
                      <img
                        src={profilePicturePreview || getAvatarUrl(user)}
                        alt="Foto Profil"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                        {name ? name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-800">Foto Profil Akun</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Format file: JPG, PNG, WEBP, GIF (Maks. 2MB)</p>
                    <label className="inline-flex items-center gap-2 mt-2.5 px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold transition cursor-pointer shadow-xs">
                      <Camera className="h-3.5 w-3.5" />
                      <span>{profilePictureFile ? profilePictureFile.name : "Unggah Foto Baru"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfilePictureFile(file);
                            setProfilePicturePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {user?.role === "rumah_sakit" || user?.role === "faskes" ? "Nama Instansi / Faskes" : "Nama Lengkap"}
                      </label>
                    </div>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9\s.,'()\-]/g, ""))}
                        disabled={!isFieldEditable("name")}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition ${
                          isFieldEditable("name")
                            ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                            : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Kecuali - Permanen dengan Status Verifikasi & Aktif) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Alamat Email (Akun)
                      </label>
                      
                      {statusAccount !== "active" && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 shadow-2xs">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            Belum Terverifikasi
                          </span>
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className="text-[10px] font-bold text-pink-600 hover:text-pink-700 underline transition cursor-pointer disabled:opacity-50"
                          >
                            {resendLoading ? "Mengirim..." : "Kirim Ulang Link"}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium cursor-not-allowed font-mono"
                      />
                      {statusAccount === "active" && (
                        <CheckCircle className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                   {/* NIK */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          {user?.role === "rumah_sakit" || user?.role === "faskes" ? "Nomor Izin Operasional (SIP)" : "NIK"}
                        </label>
                     </div>
                     <div className="relative">
                       <input
                         type="text"
                         maxLength={16}
                         value={nik}
                         onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                         disabled={isNikFilledOnLoad || !isFieldEditable("nik")}
                         className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm font-mono transition ${
                           !isNikFilledOnLoad && isFieldEditable("nik")
                             ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                             : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                         }`}
                         placeholder={user?.role === "rumah_sakit" || user?.role === "faskes" ? "Masukkan Nomor Izin Operasional" : "3171010509840002"}
                       />
                       {isNikFilledOnLoad && (
                         <CheckCircle className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500 animate-pulse" />
                       )}
                     </div>
                   </div>

                   {/* Nomor Telepon */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                         Nomor Telepon
                       </label>
                     </div>
                     <div className="relative">
                       <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                       <input
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         disabled={!isFieldEditable("phone")}
                         placeholder="+62 812 3456 7890"
                         className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition ${
                           isFieldEditable("phone")
                             ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                             : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                         }`}
                       />
                     </div>
                   </div>

                  {/* Pasien Specific Fields */}
                  {user?.role === "pasien" && (
                    <>
                      {/* Tanggal Lahir */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Tanggal Lahir
                          </label>
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            readOnly
                            placeholder="Pilih Tanggal Lahir"
                            value={
                              dateOfBirth
                                ? new Date(dateOfBirth).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : ""
                            }
                            onClick={() => {
                              if (isFieldEditable("dateOfBirth")) {
                                setShowDatePicker(!showDatePicker);
                              }
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition ${
                              isFieldEditable("dateOfBirth")
                                ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden cursor-pointer"
                                : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            }`}
                          />
                        </div>

                        {showDatePicker && isFieldEditable("dateOfBirth") && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                            <div className="absolute left-0 bottom-full mb-2 p-4 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-100">
                              <div className="flex items-center justify-between gap-1 mb-3">
                                <select
                                  value={viewDate.getMonth()}
                                  onChange={(e) => {
                                    const newD = new Date(viewDate);
                                    newD.setMonth(parseInt(e.target.value));
                                    setViewDate(newD);
                                  }}
                                  className="text-xs font-bold text-slate-700 border border-slate-200 rounded-lg p-1 bg-white outline-hidden cursor-pointer"
                                >
                                  {[
                                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                                  ].map((m, idx) => (
                                    <option key={idx} value={idx}>{m}</option>
                                  ))}
                                </select>

                                <select
                                  value={viewDate.getFullYear()}
                                  onChange={(e) => {
                                    const newD = new Date(viewDate);
                                    newD.setFullYear(parseInt(e.target.value));
                                    setViewDate(newD);
                                  }}
                                  className="text-xs font-bold text-slate-700 border border-slate-200 rounded-lg p-1 bg-white outline-hidden cursor-pointer"
                                >
                                  {Array.from(
                                    { length: new Date().getFullYear() - 1939 },
                                    (_, i) => new Date().getFullYear() - i
                                  ).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                                  <div key={d}>{d}</div>
                                ))}
                              </div>

                              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {Array.from({
                                  length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(),
                                }).map((_, idx) => (
                                  <div key={`empty-${idx}`} />
                                ))}
                                {Array.from({
                                  length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate(),
                                }).map((_, idx) => {
                                  const dayNum = idx + 1;
                                  const formattedMonth = String(viewDate.getMonth() + 1).padStart(2, "0");
                                  const formattedDay = String(dayNum).padStart(2, "0");
                                  const isSelected =
                                    dateOfBirth === `${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

                                  return (
                                    <button
                                      key={`day-${dayNum}`}
                                      type="button"
                                      onClick={() => {
                                        setDateOfBirth(`${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`);
                                        setShowDatePicker(false);
                                      }}
                                      className={`py-1.5 rounded-lg font-semibold hover:bg-pink-50 transition cursor-pointer ${
                                        isSelected
                                          ? "bg-pink-600 text-white hover:bg-pink-600"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {dayNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Jenis Kelamin */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Jenis Kelamin
                          </label>
                        </div>
                        <select
                          value={sex}
                          onChange={(e) => setSex(e.target.value)}
                          disabled={!isFieldEditable("sex")}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition ${
                            isFieldEditable("sex")
                              ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                              : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                 {/* Alamat Tempat Tinggal */}
                 <div>
                   <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {user?.role === "rumah_sakit" || user?.role === "faskes" ? "Alamat Instansi / Faskes" : "Alamat Tempat Tinggal"}
                      </label>
                   </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isFieldEditable("address")}
                      placeholder={user?.role === "rumah_sakit" || user?.role === "faskes" ? "Jl. Bukit Jarian No. 40, Bandung" : "Jl. Raya Kebon Jeruk No. 12"}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition ${
                        isFieldEditable("address")
                          ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                          : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                 <div className="pt-4 border-t border-slate-100 flex justify-end">
                   {!isEditMode ? (
                     <button
                       type="button"
                       onClick={() => setIsEditMode(true)}
                       className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-pink-500 transition cursor-pointer"
                     >
                       <Edit3 className="h-4 w-4" />
                       Ubah Data
                     </button>
                   ) : (
                     <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={handleCancelEdit}
                         className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                       >
                         Batal
                       </button>
                       <button
                         type="submit"
                         disabled={profileLoading || !hasChanges}
                         className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {profileLoading ? (
                           <Loader className="h-4 w-4 animate-spin" />
                         ) : (
                           <Save className="h-4 w-4" />
                         )}
                         Simpan Perubahan
                       </button>
                     </div>
                   )}
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
