"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { User, Lock, LogIn, AlertCircle, Loader, ArrowRight, ArrowLeft, Home, Mail, CheckCircle, Eye, EyeOff, Building2, KeyRound, IdCard } from "lucide-react";
import { apiPost, setTokens, setUser } from "@/lib/api";
import { useToast } from "@/components/shared/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState("pasien"); // "pasien", "rumah_sakit"
  const [loginStep, setLoginStep] = useState("select"); // "select", "form"

  // Khusus role pasien: metode login dipilih eksplisit oleh user, TIDAK auto-detect
  const [pasienLoginMethod, setPasienLoginMethod] = useState("email"); // "email" | "nik"

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInactive, setIsInactive] = useState(false);
  const [isPinNotSet, setIsPinNotSet] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Login pakai NIK+PIN hanya berlaku jika role pasien DAN user memilih metode "nik"
  const isNikMode = role === "pasien" && pasienLoginMethod === "nik";

  const handleGoogleLoginSuccess = async (response) => {
    setError("");
    setLoading(true);
    try {
      const result = await apiPost("/api/auth/google-login", { idToken: response.credential });

      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);
        toast.success("Login Google berhasil!");

        const userRole = result.data.user.role;
        if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "rumah_sakit" || userRole === "dokter" || userRole === "faskes") {
          router.push("/dashboard/faskes");
        } else {
          router.push("/dashboard/pasien");
        }
      }
    } catch (err) {
      const errMsg = err.message || "Gagal masuk menggunakan Google";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleScriptLoad = () => {
    if (typeof window !== "undefined" && window.google) {
      const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "501418475114-g7b5cauv82eh8v1jhakvqggu3et9okrh.apps.googleusercontent.com").trim();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLoginSuccess,
      });

      const containerForm = document.getElementById("google-signin-btn-form");
      if (containerForm) {
        window.google.accounts.id.renderButton(
          containerForm,
          { theme: "outline", size: "large", width: "320", text: "continue_with" }
        );
      }

      const containerSelect = document.getElementById("google-signin-btn-select");
      if (containerSelect) {
        window.google.accounts.id.renderButton(
          containerSelect,
          { theme: "outline", size: "large", width: "320", text: "continue_with" }
        );
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScriptLoad();
    }, 150);
    return () => clearTimeout(timer);
  }, [loginStep, role]);

  // Reset field kredensial & identifier setiap kali metode login pasien berpindah (email <-> NIK)
  useEffect(() => {
    setIdentifier("");
    setPassword("");
    setPin("");
    setError("");
    setIsInactive(false);
    setIsPinNotSet(false);
    setResendMsg("");
  }, [pasienLoginMethod, role]);

  const handleIdentifierChange = (e) => {
    if (isNikMode) {
      // Hanya angka, dibatasi tegas maksimal 16 digit
      const val = e.target.value.replace(/\D/g, "").slice(0, 16);
      setIdentifier(val);
    } else {
      const val = e.target.value.toLowerCase().replace(/[^a-z0-9@._\-+]/g, "");
      setIdentifier(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setIsInactive(false);
    setIsPinNotSet(false);

    // Validasi ketat NIK: harus TEPAT 16 digit, tidak boleh kurang/lebih
    if (isNikMode && !/^\d{16}$/.test(identifier)) {
      const msg = "NIK harus terdiri dari tepat 16 digit angka.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isNikMode && !/^\d{6}$/.test(pin)) {
      const msg = "PIN harus terdiri dari 6 digit angka.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const payload = isNikMode
        ? { identifier, pin }
        : { identifier, password };

      const result = await apiPost("/api/auth/login", payload);

      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);
        toast.success("Berhasil masuk!");

        const userRole = result.data.user.role;
        if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "rumah_sakit" || userRole === "dokter" || userRole === "faskes") {
          router.push("/dashboard/faskes");
        } else {
          router.push("/dashboard/pasien");
        }
      }
    } catch (err) {
      const msg = err.message || "Login gagal, silakan periksa kredensial Anda.";
      const lowerMsg = msg.toLowerCase();

      const isGooglePasswordNotSet =
        lowerMsg.includes("belum set password") ||
        lowerMsg.includes("belum memiliki password") ||
        lowerMsg.includes("password belum diset");

      const isPinBelumDiatur = lowerMsg.includes("belum mengatur pin");

      if (isGooglePasswordNotSet) {
        const googleLoginMsg = "Password belum diset pada akun ini. Silakan masuk langsung dengan Google yang terdaftar.";
        setError(googleLoginMsg);
        toast.error(googleLoginMsg);
        return;
      }

      if (isPinBelumDiatur) {
        setIsPinNotSet(true);
      }

      setError(msg);
      toast.error(msg);

      if (err.status === 403 && lowerMsg.includes("aktif")) {
        setIsInactive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    if (!identifier || isNikMode) {
      const msg = "Masukkan alamat email Anda terlebih dahulu.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setResendLoading(true);
    setResendMsg("");
    try {
      const result = await apiPost("/api/auth/resend-activation", { email: identifier });
      const msg = result.message || "Email aktivasi berhasil dikirim ulang.";
      setResendMsg(msg);
      toast.success(msg);
    } catch (err) {
      const msg = err.message || "Gagal mengirim ulang email aktivasi.";
      setError(msg);
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side - Description Panel with Background Image & Maroon Highlight */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative p-12 flex-col justify-between overflow-hidden text-white shrink-0">
        <Image
          src="/images/login.jpg"
          alt="Login Background"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/70 via-primary-hover/60 to-teal-900/80" />

        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-teal-600 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  <Image
                    src="/images/logo.png"
                    alt="Satu Data logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </span>
              </span>
              <div>
                <div className="text-lg font-bold text-white tracking-wider">Satu Data</div>
                <div className="text-xs text-white/80">Healthcare Hub</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-lg text-white/90">
              Gerakan kesehatan digital yang sedang bertumbuh melayani transparansi data medis Anda
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Autentikasi Aman</h3>
                <p className="text-white/80 text-sm">Enkripsi end-to-end untuk semua data akun Anda</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Proses Cepat</h3>
                <p className="text-white/80 text-sm">Login instan, akses rekam medis dalam 3 detik</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Kontrol Penuh</h3>
                <p className="text-white/80 text-sm">Anda menentukan siapa yang bisa akses data Anda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/80 text-sm">
          © 2026 SatuData. Semua hak dilindungi.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col justify-center p-3 sm:p-6 lg:p-12 overflow-y-auto bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md mx-auto my-auto space-y-2.5 sm:space-y-4 py-1 lg:py-0">
          <div className="mb-2 sm:mb-4 flex justify-end">
            <Link href="/" className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-2xs transition hover:bg-secondary-tint">
              <Home className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </Link>
          </div>

          <div className="bg-primary rounded-t-3xl px-5 py-4 sm:px-8 sm:py-8 text-white">
            <h2 className="text-lg sm:text-2xl font-bold">
              {loginStep === "select" ? "Pilih Metode Masuk" : `Masuk sebagai ${role === "pasien" ? "Pasien" : "Fasilitas Kesehatan"}`}
            </h2>
            <p className="text-teal-100 mt-1 sm:mt-2 text-xs sm:text-sm">
              {loginStep === "select" ? "Tentukan peran Anda untuk mengakses sistem" : "Silakan isi kredensial akun Anda"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-b-3xl px-5 py-5 sm:px-8 sm:py-8 border border-t-0 border-slate-200">
            {loginStep === "select" ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Option 1: Pasien */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("pasien");
                    setPasienLoginMethod("email");
                    setLoginStep("form");
                    setError("");
                  }}
                  className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-secondary-tint bg-white text-left transition duration-200 group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Pasien Terdaftar</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Akses berkas EHR, kelola audit log & persetujuan medis</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Option 2: Faskes */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("rumah_sakit");
                    setLoginStep("form");
                    setError("");
                  }}
                  className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-secondary-tint bg-white text-left transition duration-200 group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Fasilitas Kesehatan / RS</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Kelola data medis pasien, ajukan izin akses blockchain</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Divider Line & Google Sign-In */}
                <div className="relative my-2.5 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold">atau</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-0.5">
                  <div id="google-signin-btn-select" className="w-full flex justify-center" style={{ minHeight: "44px" }} />
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-200 mt-3 sm:mt-4 text-center">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Belum punya akun?{" "}
                    <Link href="/auth/register" className="text-primary hover:text-primary-hover font-semibold transition">
                      Daftar di sini
                      <ArrowRight className="inline-block ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-6 animate-fade-in">
                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep("select");
                    setError("");
                    setIdentifier("");
                    setPassword("");
                    setPin("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer mb-1 sm:mb-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke pilihan metode</span>
                </button>

                {/* Pilihan eksplisit metode login khusus role pasien */}
                {role === "pasien" && (
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setPasienLoginMethod("email")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                        pasienLoginMethod === "email"
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email &amp; Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasienLoginMethod("nik")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                        pasienLoginMethod === "nik"
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <IdCard className="h-3.5 w-3.5" />
                      NIK &amp; PIN
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 sm:p-4 text-xs sm:text-sm text-red-700 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>

                    {isInactive && (
                      <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs">
                        <span>Akun belum diaktivasi via email?</span>
                        <button
                          type="button"
                          onClick={handleResendActivation}
                          disabled={resendLoading}
                          className="inline-flex items-center gap-1 font-bold text-primary underline hover:text-primary-hover cursor-pointer disabled:opacity-50"
                        >
                          {resendLoading ? <Loader className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                          Kirim Ulang Email Aktivasi
                        </button>
                      </div>
                    )}

                    {isPinNotSet && (
                      <div className="pt-2 border-t border-red-200/60 text-xs">
                        Silakan masuk menggunakan email &amp; password terlebih dahulu, lalu atur PIN Anda di halaman profil.
                      </div>
                    )}
                  </div>
                )}

                {resendMsg && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 sm:p-3 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{resendMsg}</span>
                  </div>
                )}

                {/* Identifier: Email atau NIK, tergantung metode yang dipilih */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    {role === "pasien"
                      ? (isNikMode ? "NIK (16 digit) *" : "Email Pasien *")
                      : "Email Fasilitas Kesehatan (Faskes) *"}
                  </label>
                  <div className="relative">
                    {role === "pasien" ? (
                      isNikMode ? (
                        <IdCard className="absolute left-3 top-2.5 sm:top-3 h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400" />
                      ) : (
                        <User className="absolute left-3 top-2.5 sm:top-3 h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400" />
                      )
                    ) : (
                      <Building2 className="absolute left-3 top-2.5 sm:top-3 h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400" />
                    )}
                    <input
                      type="text"
                      inputMode={isNikMode ? "numeric" : "text"}
                      value={identifier}
                      onChange={handleIdentifierChange}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      maxLength={isNikMode ? 16 : undefined}
                      placeholder={
                        role === "pasien"
                          ? (isNikMode ? "16 digit NIK, contoh: 3171010509840002" : "contoh: pasien@email.com")
                          : "contoh: admin@rumahsakit.com"
                      }
                      className={`w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-xs sm:text-sm ${
                        isNikMode ? "font-mono tracking-wider" : "lowercase"
                      }`}
                      required
                      disabled={loading}
                    />
                  </div>
                  {isNikMode && (
                    <p className="mt-1.5 text-[10px] sm:text-[11px] text-slate-500">
                      {identifier.length}/16 digit
                      {identifier.length > 0 && identifier.length !== 16 && (
                        <span className="text-red-500 font-semibold"> — NIK harus tepat 16 digit</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Kredensial: PIN (mode NIK) atau Password (mode email / rumah_sakit) */}
                {isNikMode ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        PIN (6 digit) *
                      </label>
                      <Link
                        href="/auth/forgot-pin"
                        className="text-xs text-primary hover:text-primary-hover font-medium transition"
                      >
                        Lupa PIN?
                      </Link>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 sm:top-3.5 h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400" />
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setPin(val);
                        }}
                        maxLength={6}
                        placeholder="••••••"
                        className="w-full pl-9 pr-11 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-xs sm:text-sm tracking-[0.3em]"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                        aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                      >
                        {showPin ? (
                          <EyeOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-primary hover:text-primary-hover font-medium transition"
                      >
                        Lupa password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 sm:top-3.5 h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-11 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-xs sm:text-sm"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (isNikMode && (identifier.length !== 16 || pin.length !== 6))}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 sm:py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4.5 w-4.5 sm:h-5 sm:w-5 animate-spin" />
                      Sedang memproses...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                      Masuk Sekarang
                    </>
                  )}
                </button>

                <div className="relative my-2.5 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold">atau</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-0.5">
                  <div id="google-signin-btn-form" className="w-full flex justify-center" style={{ minHeight: "44px" }} />
                </div>

                <p className="text-center text-xs sm:text-sm text-slate-600 pt-2 sm:pt-4">
                  Belum punya akun?{" "}
                  <Link href="/auth/register" className="text-primary hover:text-primary-hover font-semibold transition">
                    Daftar di sini
                    <ArrowRight className="inline-block ml-1 h-3 w-3" />
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
    </div>
  );
}