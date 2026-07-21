"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Loader, 
  ArrowRight, 
  CheckCircle2, 
  Home,
  Calendar,
  FileText,
  Globe,
  Heart
} from "lucide-react";
import { apiPost } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("pasien");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nik, setNik] = useState("");

  // Pasien Specific Fields
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("L");
  const [bloodType, setBloodType] = useState("O");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Hospital Specific Fields
  const [medicalLicense, setMedicalLicense] = useState("");
  const [hospitalType, setHospitalType] = useState("umum");
  const [ownership, setOwnership] = useState("swasta");
  const [accreditation, setAccreditation] = useState("paripurna");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let payload = {
        role,
        name,
        email,
        password,
        phone: phone || undefined,
        address: address || undefined,
        nik: nik || undefined,
      };

      if (role === "pasien") {
        payload = {
          ...payload,
          place_of_birth: placeOfBirth || undefined,
          date_of_birth: dateOfBirth || undefined,
          sex,
          blood_type: bloodType,
          emergency_contact_name: emergencyName || undefined,
          emergency_contact_phone: emergencyPhone || undefined,
        };
      } else if (role === "rumah_sakit") {
        payload = {
          ...payload,
          medical_license: medicalLicense || undefined,
          hospital_type: hospitalType,
          ownership,
          accreditation,
          website: website || undefined,
          description: description || undefined,
        };
      }

      const result = await apiPost("/api/auth/register", payload);

      if (result.success) {
        setSuccess(result.message || "Registrasi berhasil! Silakan periksa email Anda untuk mengaktifkan akun.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3500);
      }
    } catch (err) {
      setError(err.message || "Registrasi gagal, periksa kembali kelengkapan data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50">
      {/* Left Side - Hero Description Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#7F1D1D] via-[#A61B2D] to-[#4C0B14] p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
            </span>
            <div>
              <div className="text-lg font-bold tracking-wider">Satu Data</div>
              <div className="text-xs text-white/80">Healthcare Hub v2.5</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
              Kedaulatan Rekam Medis Digital
            </h1>
            <p className="text-sm text-white/90 leading-relaxed max-w-md">
              Bergabunglah dengan ekosistem kesehatan terintegrasi SATUSEHAT & Web3 Sovereign Blockchain. Pasien sebagai pemilik data sah, Faskes sebagai pemproses terverifikasi.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">✓</span>
              <span className="text-xs font-medium">100% Hak Akses Kendali Pasien (Smart Contract)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">✓</span>
              <span className="text-xs font-medium">Enkripsi Off-Chain AES-256 Terstandarisasi</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">✓</span>
              <span className="text-xs font-medium">Immutable Audit Trail untuk Faskes & Klinik</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/70">
          © 2026 SatuData Healthcare. Kemenkes & Web3 Compliant.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex rounded-2xl bg-slate-200/80 p-1 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setRole("pasien")}
                className={`rounded-xl px-4 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  role === "pasien"
                    ? "bg-[#7F1D1D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pasien Baru
              </button>
              <button
                type="button"
                onClick={() => setRole("rumah_sakit")}
                className={`rounded-xl px-4 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  role === "rumah_sakit"
                    ? "bg-[#7F1D1D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fasilitas Kesehatan / RS
              </button>
            </div>

            <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#7F1D1D] shadow-2xs hover:bg-slate-100 transition">
              <Home className="h-4 w-4" />
            </Link>
          </div>

          {/* Header Card */}
          <div className="bg-[#7F1D1D] rounded-t-3xl p-6 text-white">
            <h2 className="text-xl font-bold">
              {role === "pasien" ? "Pendaftaran Akun Pasien" : "Pendaftaran Fasilitas Kesehatan (RS)"}
            </h2>
            <p className="text-rose-100 text-xs mt-1">
              {role === "pasien" 
                ? "Lengkapi identitas diri Anda untuk mendapatkan kontrol penuh rekam medis." 
                : "Daftarkan Rumah Sakit atau Klinik Anda untuk terintegrasi dengan SATUSEHAT API."}
            </p>
          </div>

          {/* Form Card Body */}
          <div className="bg-white rounded-b-3xl p-6 border border-t-0 border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form Input Grid */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === "pasien" ? "Nama Lengkap Pasien *" : "Nama Fasilitas Kesehatan / RS *"}
                  </label>
                  <div className="relative">
                    {role === "pasien" ? <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /> : <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === "pasien" ? "cth: Budi Santoso" : "cth: RS Sehat Selalu"}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Aktif *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 karakter (huruf & angka)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                      required
                    />
                  </div>
                </div>

                {/* NIK */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === "pasien" ? "NIK Pasien (16 Digit) *" : "NIK Penanggung Jawab *"}
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="3201010101010001"
                    maxLength={16}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs font-mono"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                {/* PASIEN ROLE SPECIFIC FIELDS */}
                {role === "pasien" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={placeOfBirth}
                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                        placeholder="cth: Bandung"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Golongan Darah</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs font-mono"
                      >
                        <option value="O">O</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kontak Darurat (Nama)</label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Nama Kontak Darurat"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. Kontak Darurat</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="0811..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs font-mono"
                      />
                    </div>
                  </>
                )}

                {/* RUMAH SAKIT ROLE SPECIFIC FIELDS */}
                {role === "rumah_sakit" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. Izin Operasional Medis *</label>
                      <input
                        type="text"
                        value={medicalLicense}
                        onChange={(e) => setMedicalLicense(e.target.value)}
                        placeholder="SIP-2026-001"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Fasilitas Kesehatan</label>
                      <select
                        value={hospitalType}
                        onChange={(e) => setHospitalType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      >
                        <option value="umum">Rumah Sakit Umum</option>
                        <option value="khusus">Rumah Sakit Khusus</option>
                        <option value="klinik">Klinik Utama / Pratama</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kepemilikan</label>
                      <select
                        value={ownership}
                        onChange={(e) => setOwnership(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      >
                        <option value="swasta">Swasta</option>
                        <option value="pemerintah">Pemerintah</option>
                        <option value="bumn">BUMN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Akreditasi</label>
                      <select
                        value={accreditation}
                        onChange={(e) => setAccreditation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      >
                        <option value="paripurna">Paripurna (Bintang 5)</option>
                        <option value="utama">Utama (Bintang 4)</option>
                        <option value="madya">Madya (Bintang 3)</option>
                        <option value="pratama">Pratama</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Website Resmi Faskes</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://rssehat.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs"
                      />
                    </div>
                  </>
                )}

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan jalan, no., kelurahan, kecamatan, kota..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#7F1D1D] outline-none transition text-xs resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3 rounded-xl transition cursor-pointer disabled:opacity-50 mt-4 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Sedang Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Sekarang</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-600 pt-2">
                Sudah memiliki akun terdaftar?{" "}
                <Link href="/auth/login" className="text-[#7F1D1D] hover:underline font-bold">
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
