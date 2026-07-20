"use client";

import { useState } from "react";
import { Mail, Lock, User, Building, Phone, AlertCircle, Loader, CheckCircle } from "lucide-react";

export default function RegisterForm({ onSuccess, onClose }) {
  const [role, setRole] = useState("pasien");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        role,
        name,
        email,
        password,
        phone: phone || null,
        address: address || null,
      };

      if (role === "pasien") {
        // Bisa tambah NIK, DOB, sex nanti
      } else if (role === "rumah_sakit") {
        payload.hospital_name = name;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registrasi gagal");
      }

      setSuccess("Registrasi berhasil! Silakan login dengan akun Anda.");
      setTimeout(() => {
        onSuccess && onSuccess(result.data);
        onClose && onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 sticky top-0">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 sticky top-0">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Akun</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
        >
          <option value="pasien">Pasien</option>
          <option value="rumah_sakit">Rumah Sakit / Klinik</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {role === "pasien" ? "Nama Lengkap" : "Nama Institusi"}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === "pasien" ? "Budi Santoso" : "Rumah Sakit Cipto"}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon (Opsional)</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 812 3456 7890"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Alamat (Opsional)</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Jl. Contoh No. 123"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition resize-none"
          rows={3}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-fuchsia-500 text-white font-bold py-2.5 rounded-lg hover:from-pink-400 hover:to-fuchsia-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            Daftar Sekarang
          </>
        )}
      </button>
    </form>
  );
}
