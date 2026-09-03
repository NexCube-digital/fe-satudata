"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { User, Lock, Wallet, Loader } from "lucide-react";
import { getAvatarUrl } from "@/lib/api";

import SettingsHubMobile from "./settings/SettingsHubMobile";
import ProfileSettingsTab from "./settings/ProfileSettingsTab";
import SecuritySettingsTab from "./settings/SecuritySettingsTab";
import WalletSettingsTab from "./settings/WalletSettingsTab";
import PhotoUploadModal from "./settings/PhotoUploadModal";

export default function SettingPage({ initialTab = "profile" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // State Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [isNikFilledOnLoad, setIsNikFilledOnLoad] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("L");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [initialLatitude, setInitialLatitude] = useState("");
  const [initialLongitude, setInitialLongitude] = useState("");
  const [statusAccount, setStatusAccount] = useState("active");
  const [resendLoading, setResendLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Photo Crop & Camera Modal States
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  // Crop / Drag Adjuster States
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

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

  const isFieldEditable = (field) => {
    if (field === "nik" && isNikFilledOnLoad) return false;
    if (field === "email") return false;
    return true;
  };

  const hasChanges = 
    name !== initialName ||
    phone !== initialPhone ||
    address !== initialAddress ||
    latitude !== initialLatitude ||
    longitude !== initialLongitude ||
    (user?.role === "pasien" && (
      dateOfBirth !== initialDateOfBirth ||
      sex !== initialSex ||
      (!isNikFilledOnLoad && nik !== initialNik)
    )) ||
    profilePictureFile !== null;

  // State Security (Update / Set Password)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const needsPasswordSetup = user?.hasPassword === false;

  // State Security (Set / Update PIN) - khusus role pasien
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMsg, setPinMsg] = useState({ type: "", text: "" });

  const needsPinSetup = user?.hasPin === false;

  // State Wallet (personal - non-admin)
  const [walletAddress, setWalletAddress] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState({ type: "", text: "" });
  const [walletBalance, setWalletBalance] = useState("");

  // State System Wallet (admin only)
  const [systemWallet, setSystemWallet] = useState(null);
  const [systemWalletBalance, setSystemWalletBalance] = useState("");
  const [systemWalletLoading, setSystemWalletLoading] = useState(false);

  const fetchWalletBalance = async (address) => {
    if (!address) return;
    try {
      const BC_URL = process.env.NEXT_PUBLIC_BC_SERVICE_URL || "http://localhost:4000";
      const res = await fetch(`${BC_URL}/api/bc/wallet-balance?address=${address}`);
      const result = await res.json();
      if (res.ok && result.success) {
        const balanceEth = parseFloat(result.balance);
        setWalletBalance(balanceEth.toFixed(4) + " ETH");
      } else {
        setWalletBalance("0.0000 ETH");
      }
    } catch (err) {
      console.error("Error fetching balance from blockchain service:", err);
      setWalletBalance("0.0000 ETH");
    }
  };

  const fetchSystemWallet = async () => {
    setSystemWalletLoading(true);
    try {
      const BC_URL = process.env.NEXT_PUBLIC_BC_SERVICE_URL || "http://localhost:4000";
      const statusRes = await fetch(`${BC_URL}/api/bc/status`);
      const statusData = await statusRes.json();
      const address = statusData?.adminWallet;
      setSystemWallet(statusData);
      if (address) {
        const balRes = await fetch(`${BC_URL}/api/bc/wallet-balance?address=${address}`);
        const balData = await balRes.json();
        if (balRes.ok && balData.success) {
          setSystemWalletBalance(parseFloat(balData.balance).toFixed(6) + " ETH");
        } else {
          setSystemWalletBalance("0.000000 ETH");
        }
      }
    } catch (err) {
      console.error("Error fetching system wallet:", err);
    } finally {
      setSystemWalletLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchWalletBalance(walletAddress);
    } else {
      setWalletBalance("");
    }
  }, [walletAddress]);

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

        if (parsed.role === "admin") {
          fetchSystemWallet();
        }

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

  const startCamera = async () => {
    setCameraActive(true);
    setSourceImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setVideoStream(stream);
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert("Tidak dapat mengakses kamera. Harap periksa izin browser.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext("2d");
      
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSourceImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (!sourceImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!sourceImage) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPanX(touch.clientX - dragStart.x);
    setPanY(touch.clientY - dragStart.y);
  };

  const handleCropSave = () => {
    if (!sourceImage) return;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const containerSize = 240;
      const canvasScale = 300 / containerSize;

      const imgAspect = img.width / img.height;
      let renderWidth = containerSize;
      let renderHeight = containerSize;

      if (imgAspect > 1) {
        renderHeight = containerSize / imgAspect;
      } else {
        renderWidth = containerSize * imgAspect;
      }

      const x0 = (containerSize - renderWidth) / 2;
      const y0 = (containerSize - renderHeight) / 2;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2 + (panX * canvasScale), -canvas.height / 2 + (panY * canvasScale));

      ctx.drawImage(
        img,
        x0 * canvasScale,
        y0 * canvasScale,
        renderWidth * canvasScale,
        renderHeight * canvasScale
      );
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "cropped-profile-photo.jpg", { type: "image/jpeg" });
          setProfilePictureFile(file);
          setProfilePicturePreview(URL.createObjectURL(file));
          setIsPhotoModalOpen(false);
          setSourceImage(null);
          setZoom(1);
          setPanX(0);
          setPanY(0);
        }
      }, "image/jpeg", 0.95);
    };
    img.src = sourceImage;
  };

  const fetchProfile = async (currentUser) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const isHospital = currentUser?.role === "rumah_sakit" || currentUser?.role === "faskes";
    const isAdmin = currentUser?.role === "admin";
    const endpoint = isHospital
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/profile`
      : isAdmin
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/admin/profile`
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

          const hLat = u.hospitalProfile.latitude || "";
          setLatitude(hLat);
          setInitialLatitude(hLat);

          const hLng = u.hospitalProfile.longitude || "";
          setLongitude(hLng);
          setInitialLongitude(hLng);
        }

        const computedAvatar = getAvatarUrl(u);
        const updatedUser = {
          ...(currentUser || {}),
          ...u,
          hasPassword: typeof u.hasPassword === "boolean" ? u.hasPassword : currentUser?.hasPassword,
          hasPin: typeof u.hasPin === "boolean" ? u.hasPin : currentUser?.hasPin,
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const isHospital = user?.role === "rumah_sakit" || user?.role === "faskes";
      const isAdmin = user?.role === "admin";
      const endpoint = isHospital
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/profile`
        : isAdmin
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/admin/profile`
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
        if (isHospital) {
          if (latitude) formData.append("latitude", latitude);
          if (longitude) formData.append("longitude", longitude);
        }
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
          payload.latitude = latitude;
          payload.longitude = longitude;
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
      setInitialLatitude(latitude);
      setInitialLongitude(longitude);
      setInitialDateOfBirth(dateOfBirth);
      setInitialSex(sex);
      setInitialNik(nik);
      if (nik) {
        setIsNikFilledOnLoad(true);
      }
      setProfilePictureFile(null);

      setProfileMsg({ type: "success", text: result.message || "Profil berhasil diperbarui!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Kata sandi baru minimal 8 karakter" });
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

      const endpoint = needsPasswordSetup
        ? `${base}/api/auth/set-password`
        : `${base}/api/auth/update-password`;

      const body = needsPasswordSetup
        ? { newPassword, confirmPassword }
        : { oldPassword, newPassword, confirmPassword };

      const res = await fetch(endpoint, {
        method: needsPasswordSetup ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui kata sandi");
      }

      setPasswordMsg({
        type: "success",
        text: result.message || (needsPasswordSetup ? "Kata sandi berhasil diatur!" : "Kata sandi berhasil diperbarui!")
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (needsPasswordSetup) {
        const updatedUser = { ...user, hasPassword: true };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    setPinMsg({ type: "", text: "" });

    if (!/^\d{6}$/.test(newPin)) {
      setPinMsg({ type: "error", text: "PIN baru harus terdiri dari 6 digit angka" });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMsg({ type: "error", text: "Konfirmasi PIN baru tidak cocok" });
      return;
    }

    if (!needsPinSetup && newPin === oldPin) {
      setPinMsg({ type: "error", text: "PIN baru tidak boleh sama dengan PIN lama" });
      return;
    }

    setPinLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

      const endpoint = needsPinSetup
        ? `${base}/api/auth/set-pin`
        : `${base}/api/auth/update-pin`;

      const body = needsPinSetup
        ? { newPin, confirmPin }
        : { oldPin, newPin, confirmPin };

      const res = await fetch(endpoint, {
        method: needsPinSetup ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui PIN");
      }

      setPinMsg({
        type: "success",
        text: result.message || (needsPinSetup ? "PIN berhasil diatur!" : "PIN berhasil diperbarui!")
      });
      setOldPin("");
      setNewPin("");
      setConfirmPin("");

      if (needsPinSetup) {
        const updatedUser = { ...user, hasPin: true };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      setPinMsg({ type: "error", text: err.message });
    } finally {
      setPinLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setWalletMsg({ type: "", text: "" });
    setWalletLoading(true);

    try {
      if (typeof window.ethereum === "undefined") {
        const simulatedAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setWalletAddress(simulatedAddress);
        const updatedUser = { ...user, wallet_address: simulatedAddress };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setWalletMsg({ type: "success", text: `MetaMask berhasil ditautkan: ${simulatedAddress.substring(0, 6)}...${simulatedAddress.substring(38)}` });
        setWalletLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      const token = localStorage.getItem("accessToken");

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

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [messageToSign, address]
      });

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
        <Loader className="h-8 w-8 animate-spin text-[#0D9488]" />
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      {/* Top Navbar: Always visible on desktop */}
      <div className="hidden md:block">
        <Navbar user={user} roleLabel={roleLabelMap[user?.role] || "Dashboard"} onLogout={handleLogout} fixed />
      </div>

      <div className="flex flex-1 md:pt-16">
        <Sidebar role={user?.role} />

        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full">
          {/* Desktop Title Header */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Pengaturan Akun</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola profil pribadi, kata sandi keamanan, dan koneksi dompet MetaMask Anda.
            </p>
          </div>

          {/* Desktop Horizontal Tabs */}
          <div className="hidden md:flex gap-2 border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === "profile" || activeTab === "overview"
                  ? "border-teal-700 text-teal-800"
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
                  ? "border-teal-700 text-teal-800"
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
                  ? "border-teal-700 text-teal-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Wallet className="h-4 w-4" />
              {user?.role === "admin" ? "Dompet Sistem" : "Web3 & MetaMask"}
            </button>
          </div>

          {/* MOBILE-ONLY OVERVIEW SETTINGS HUB */}
          {activeTab === "overview" && (
            <SettingsHubMobile
              user={user}
              profilePicturePreview={profilePicturePreview}
              roleLabelMap={roleLabelMap}
              nik={nik}
              handleLogout={handleLogout}
            />
          )}

          {/* TAB 1: PROFIL PENGGUNA */}
          {activeTab === "profile" && (
            <ProfileSettingsTab
              user={user}
              profileMsg={profileMsg}
              handleUpdateProfile={handleUpdateProfile}
              hasChanges={hasChanges}
              profileLoading={profileLoading}
              setIsPhotoModalOpen={setIsPhotoModalOpen}
              profilePicturePreview={profilePicturePreview}
              name={name}
              setName={setName}
              isFieldEditable={isFieldEditable}
              email={email}
              statusAccount={statusAccount}
              handleResendVerification={handleResendVerification}
              resendLoading={resendLoading}
              nik={nik}
              setNik={setNik}
              isNikFilledOnLoad={isNikFilledOnLoad}
              phone={phone}
              setPhone={setPhone}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              viewDate={viewDate}
              setViewDate={setViewDate}
              sex={sex}
              setSex={setSex}
              address={address}
              setAddress={setAddress}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
            />
          )}

          {/* TAB 2: KEAMANAN & SANDI */}
          {activeTab === "security" && (
            <SecuritySettingsTab
              user={user}
              needsPasswordSetup={needsPasswordSetup}
              passwordMsg={passwordMsg}
              handleUpdatePassword={handleUpdatePassword}
              oldPassword={oldPassword}
              setOldPassword={setOldPassword}
              showOldPassword={showOldPassword}
              setShowOldPassword={setShowOldPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordLoading={passwordLoading}
              needsPinSetup={needsPinSetup}
              pinMsg={pinMsg}
              handleUpdatePin={handleUpdatePin}
              oldPin={oldPin}
              setOldPin={setOldPin}
              showOldPin={showOldPin}
              setShowOldPin={setShowOldPin}
              newPin={newPin}
              setNewPin={setNewPin}
              showNewPin={showNewPin}
              setShowNewPin={setShowNewPin}
              confirmPin={confirmPin}
              setConfirmPin={setConfirmPin}
              showConfirmPin={showConfirmPin}
              setShowConfirmPin={setShowConfirmPin}
              pinLoading={pinLoading}
            />
          )}

          {/* TAB 3: WEB3 & METAMASK */}
          {activeTab === "wallet" && (
            <WalletSettingsTab
              user={user}
              systemWallet={systemWallet}
              systemWalletLoading={systemWalletLoading}
              systemWalletBalance={systemWalletBalance}
              fetchSystemWallet={fetchSystemWallet}
              walletMsg={walletMsg}
              walletAddress={walletAddress}
              walletBalance={walletBalance}
              handleConnectWallet={handleConnectWallet}
              walletLoading={walletLoading}
            />
          )}
        </main>
      </div>

      {/* Photo Crop & Upload Modal */}
      <PhotoUploadModal
        isPhotoModalOpen={isPhotoModalOpen}
        setIsPhotoModalOpen={setIsPhotoModalOpen}
        stopCamera={stopCamera}
        sourceImage={sourceImage}
        setSourceImage={setSourceImage}
        cameraActive={cameraActive}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        startCamera={startCamera}
        videoRef={videoRef}
        capturePhoto={capturePhoto}
        panX={panX}
        panY={panY}
        zoom={zoom}
        setZoom={setZoom}
        isDragging={isDragging}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleCropSave={handleCropSave}
        setPanX={setPanX}
        setPanY={setPanY}
      />
    </div>
  );
}