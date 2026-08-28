"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
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
  Unlock,
  Upload,
  X,
  Move,
  Server,
  Zap,
  RefreshCw,
  ShieldPlus,
  KeyRound
  ,Eye
  ,EyeOff
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
    latitude !== initialLatitude ||
    longitude !== initialLongitude ||
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
    setLatitude(initialLatitude);
    setLongitude(initialLongitude);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

  // State Security (Update / Set Password)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // true jika user login via Google dan belum pernah set password sendiri
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

  // true jika pasien belum pernah mengatur PIN sama sekali
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

  // Fetch system wallet info (admin only)
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

        // Jika admin, ambil info system wallet
        if (parsed.role === "admin") {
          fetchSystemWallet();
        }

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

  // Camera stream controllers
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

  // Drag controllers (pan image)
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

  // Crop & save as File object
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
          // Pastikan flag hasPassword & hasPin dari BE tidak hilang tertimpa data lama
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

  // Submit Update Profile
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
      setIsEditMode(false);

      setProfileMsg({ type: "success", text: result.message || "Profil berhasil diperbarui!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Update / Set Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok" });
      return;
    }

    // Samakan dengan validasi isStrongPassword di backend (minimal 8 karakter)
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Kata sandi baru minimal 8 karakter" });
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

      // Belum pernah punya password (mis. daftar/login via Google) -> set-password (tanpa oldPassword)
      // Sudah punya password -> update-password (wajib oldPassword)
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

      // Setelah set password pertama kali, tandai user sudah punya password
      // supaya form otomatis berubah jadi mode "Ganti Kata Sandi"
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

  // Submit Set / Update PIN (khusus pasien)
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

      // Belum pernah punya PIN -> set-pin (tanpa oldPin)
      // Sudah punya PIN -> update-pin (wajib oldPin)
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

      // Setelah set PIN pertama kali, tandai user sudah punya PIN
      // supaya form otomatis berubah jadi mode "Ubah PIN"
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
              {user?.role === "admin" ? "Dompet Sistem" : "Web3 & MetaMask"}
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
                  <div 
                    onClick={() => {
                      if (isEditMode) {
                        setIsPhotoModalOpen(true);
                      }
                    }}
                    className={`group relative h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-800 to-red-900 ring-4 ring-rose-500/20 shrink-0 shadow-md ${
                      isEditMode ? "cursor-pointer hover:brightness-95 transition" : ""
                    }`}
                    title={isEditMode ? "Klik untuk mengubah foto profil" : undefined}
                  >
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
                    {isEditMode && (
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-800">Foto Profil Akun</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isEditMode 
                        ? "Klik bulatan foto di sebelah kiri untuk mengganti foto lewat file atau kamera."
                        : "Klik 'Edit Profil' di bawah untuk mulai mengubah foto profil."}
                    </p>
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

                {/* Geotagging coordinates for Hospital/Faskes */}
                {(user?.role === "rumah_sakit" || user?.role === "faskes") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Latitude
                        </label>
                      </div>
                      <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        disabled={!isFieldEditable("latitude")}
                        placeholder="-6.8837"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition font-mono ${
                          isFieldEditable("latitude")
                            ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                            : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Longitude
                        </label>
                      </div>
                      <input
                        type="text"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        disabled={!isFieldEditable("longitude")}
                        placeholder="107.6049"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition font-mono ${
                          isFieldEditable("longitude")
                            ? "border-pink-600 bg-white text-slate-900 focus:ring-2 focus:ring-pink-600/20 outline-hidden"
                            : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                )}

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
            <div className="space-y-6 max-w-2xl">
              {/* CARD: Ganti / Atur Kata Sandi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                  {needsPasswordSetup ? <ShieldPlus className="h-5 w-5 text-pink-600" /> : <Lock className="h-5 w-5 text-pink-600" />}
                  {needsPasswordSetup ? "Atur Kata Sandi" : "Ganti Kata Sandi"}
                </h2>

                {needsPasswordSetup && (
                  <p className="text-sm text-slate-500 mb-4">
                    Akun Anda dibuat melalui Google dan belum memiliki kata sandi. Atur kata sandi
                    di bawah agar Anda juga bisa login menggunakan email &amp; kata sandi.
                  </p>
                )}

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
                  {/* Field kata sandi lama hanya muncul jika user SUDAH punya password */}
                  {!needsPasswordSetup && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kata Sandi Saat Ini</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showOldPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          aria-label={showOldPassword ? "Sembunyikan kata sandi saat ini" : "Tampilkan kata sandi saat ini"}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-pink-600 focus:outline-hidden"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
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
                      {needsPasswordSetup ? "Simpan Kata Sandi" : "Perbarui Kata Sandi"}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD: Atur / Ubah PIN - khusus role pasien (untuk login NIK+PIN) */}
              {user?.role === "pasien" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                    {needsPinSetup ? <ShieldPlus className="h-5 w-5 text-pink-600" /> : <KeyRound className="h-5 w-5 text-pink-600" />}
                    {needsPinSetup ? "Atur PIN" : "Ubah PIN"}
                  </h2>

                  <p className="text-sm text-slate-500 mb-4">
                    {needsPinSetup
                      ? "Atur PIN 6 digit agar Anda bisa masuk lebih cepat menggunakan NIK dan PIN, tanpa perlu memasukkan email dan kata sandi."
                      : "Ubah PIN 6 digit yang digunakan untuk login cepat dengan NIK. Masukkan PIN lama untuk verifikasi."}
                  </p>

                  {pinMsg.text && (
                    <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm ${
                      pinMsg.type === "success" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {pinMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                      <span>{pinMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePin} className="space-y-5">
                    {/* Field PIN lama hanya muncul jika user SUDAH punya PIN */}
                    {!needsPinSetup && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">PIN Saat Ini</label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type={showOldPin ? "text" : "password"}
                            inputMode="numeric"
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            placeholder="••••••"
                            className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm tracking-[0.3em] focus:border-pink-600 focus:outline-hidden"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPin(!showOldPin)}
                            aria-label={showOldPin ? "Sembunyikan PIN saat ini" : "Tampilkan PIN saat ini"}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            {showOldPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">PIN Baru</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showNewPin ? "text" : "password"}
                          inputMode="numeric"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          placeholder="6 digit angka"
                          className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm tracking-[0.3em] focus:border-pink-600 focus:outline-hidden"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPin(!showNewPin)}
                          aria-label={showNewPin ? "Sembunyikan PIN baru" : "Tampilkan PIN baru"}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Konfirmasi PIN Baru</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showConfirmPin ? "text" : "password"}
                          inputMode="numeric"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          placeholder="Ulangi PIN baru"
                          className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm tracking-[0.3em] focus:border-pink-600 focus:outline-hidden"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          aria-label={showConfirmPin ? "Sembunyikan konfirmasi PIN" : "Tampilkan konfirmasi PIN"}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={pinLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-500 transition cursor-pointer disabled:opacity-50"
                      >
                        {pinLoading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {needsPinSetup ? "Simpan PIN" : "Perbarui PIN"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEB3 & METAMASK */}
          {activeTab === "wallet" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">

              {/* ── ADMIN: tampilkan System Wallet (read-only) ── */}
              {user?.role === "admin" ? (
                <>
                  <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <Server className="h-5 w-5 text-pink-600" />
                    Dompet Sistem (Admin Wallet)
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Wallet di bawah adalah wallet sistem yang digunakan secara otomatis untuk
                    menandatangani semua transaksi on-chain (requestAccess, grantAccess, dll).
                    Wallet ini dikonfigurasi langsung di server dan tidak perlu dihubungkan secara manual.
                  </p>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Sistem</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                        systemWallet?.onChainReady
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
                        <Zap className="h-3.5 w-3.5" />
                        {systemWallet?.onChainReady ? "On-Chain Ready ✅" : "Offline / Simulation Mode"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Alamat Wallet</p>
                        <div className="text-sm font-mono bg-white p-3 rounded-xl border border-slate-200 break-all text-slate-700">
                          {systemWalletLoading ? "Memuat..." : (systemWallet?.adminWallet || "Tidak terkonfigurasi")}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Sepolia ETH</p>
                          <p className="text-xl font-extrabold text-slate-800 font-mono mt-0.5">
                            {systemWalletLoading ? "Memuat..." : (systemWalletBalance || "–")}
                          </p>
                        </div>
                        <button
                          onClick={fetchSystemWallet}
                          disabled={systemWalletLoading}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                          title="Refresh saldo"
                        >
                          <RefreshCw className={`h-4 w-4 text-slate-500 ${systemWalletLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network</p>
                          <p className="text-sm font-bold text-slate-700 mt-0.5">{systemWallet?.network || "sepolia"} (Chain ID: {systemWallet?.chainId || 11155111})</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart Contract</p>
                          <p className="text-xs font-mono text-slate-600 mt-0.5 break-all">{systemWallet?.contractAddress || "–"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {parseFloat(systemWalletBalance) < 0.001 && !systemWalletLoading && (
                    <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Saldo hampir habis!</p>
                        <p className="text-xs mt-0.5">Isi wallet dengan Sepolia ETH gratis melalui <a href="https://www.infura.io/faucet/sepolia" target="_blank" rel="noopener noreferrer" className="underline font-bold">infura.io/faucet/sepolia</a></p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── NON-ADMIN: tampilkan personal MetaMask connect ── */
                <>
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
                          <ShieldCheck className="h-4 w-4" /> Terverifikasi &amp; Ditautkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          Belum Ditautkan
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-mono bg-white p-3 rounded-xl border border-slate-200 break-all text-slate-700 mb-3">
                      {walletAddress || "Alamat wallet belum dikonfigurasi"}
                    </div>

                    {walletAddress && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-bold">Saldo Dompet (Sepolia)</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">{walletBalance || "Memuat..."}</span>
                      </div>
                    )}
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
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Photo Crop & Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col items-center">
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Camera className="h-4 w-4 text-rose-800" />
                Atur Foto Profil
              </h3>
              <button
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  stopCamera();
                }}
                className="text-slate-400 hover:text-slate-655 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content Mode Selection */}
            {!sourceImage && !cameraActive && (
              <div className="flex flex-col gap-3 w-full py-8">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 text-rose-900 font-bold hover:bg-rose-50 transition text-xs cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-rose-800" />
                  Pilih File Foto
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition text-xs cursor-pointer shadow-2xs"
                >
                  <Camera className="h-5 w-5 text-slate-550" />
                  Ambil dengan Kamera
                </button>
              </div>
            )}

            {/* Webcam Stream */}
            {cameraActive && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative h-60 w-60 rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2.5 rounded-xl bg-rose-850 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Ambil Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Cropper Adjuster */}
            {sourceImage && (
              <div className="flex flex-col items-center gap-4 w-full">
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <Move className="h-3.5 w-3.5 text-slate-400 animate-pulse" /> Geser foto dan gunakan slider untuk zoom
                </p>

                {/* Crop Box Container */}
                <div 
                  className="relative h-60 w-60 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shadow-inner cursor-move select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <img
                    src={sourceImage}
                    alt="Cropping source"
                    draggable={false}
                    className="absolute max-w-none origin-center pointer-events-none"
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                      transition: isDragging ? "none" : "transform 0.15s ease-out",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                  {/* Circular Crop Overlay Finder */}
                  <div className="absolute inset-0 border-[20px] border-slate-900/60 pointer-events-none">
                    <div className="h-full w-full rounded-full border border-white/50 border-dashed" />
                  </div>
                </div>

                {/* Zoom Slider */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Zoom Out</span>
                    <span>Zoom In</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-800"
                  />
                </div>

                <div className="flex gap-2 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleCropSave}
                    className="flex-1 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" /> Simpan Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceImage(null);
                      setZoom(1);
                      setPanX(0);
                      setPanY(0);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}