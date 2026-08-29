"use client";

import Link from "next/link";
import { 
  User, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Phone, 
  Calendar, 
  MapPin, 
  Save, 
  Loader, 
  ArrowLeft 
} from "lucide-react";
import { getAvatarUrl } from "@/lib/api";

export default function ProfileSettingsTab({
  user,
  profileMsg,
  handleUpdateProfile,
  hasChanges,
  profileLoading,
  setIsPhotoModalOpen,
  profilePicturePreview,
  name,
  setName,
  isFieldEditable,
  email,
  statusAccount,
  handleResendVerification,
  resendLoading,
  nik,
  setNik,
  isNikFilledOnLoad,
  phone,
  setPhone,
  dateOfBirth,
  setDateOfBirth,
  showDatePicker,
  setShowDatePicker,
  viewDate,
  setViewDate,
  sex,
  setSex,
  address,
  setAddress,
  latitude,
  setLatitude,
  longitude,
  setLongitude
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs">
      <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
        {/* Header Title & Top-Right Save Button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/pasien/settings"
              className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer md:hidden shrink-0"
              title="Kembali ke Pilihan Settings"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-[#0D9488]" />
              Informasi Profil
            </h2>
          </div>

          {hasChanges && (
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0F766E] transition cursor-pointer disabled:opacity-50 animate-in fade-in zoom-in duration-150 shrink-0"
            >
              {profileLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Perubahan
            </button>
          )}
        </div>

        {profileMsg.text && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-xs sm:text-sm ${
            profileMsg.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {profileMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        {/* Profile Picture Upload Box */}
        <div className="flex flex-row items-center gap-3.5 sm:gap-5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-4 sm:mb-6">
          <div 
            onClick={() => setIsPhotoModalOpen(true)}
            className="group relative h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-[#0D9488] to-[#0F766E] ring-3 ring-teal-500/20 shrink-0 shadow-sm cursor-pointer hover:brightness-95 transition"
            title="Klik untuk mengubah foto profil"
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
              <div className="flex h-full w-full items-center justify-center text-lg sm:text-2xl font-bold text-white">
                {name ? name.charAt(0).toUpperCase() : <User className="h-6 w-6 sm:h-8 sm:w-8" />}
              </div>
            )}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Foto Profil Akun</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
              Tekan foto di sebelah kiri untuk mengganti foto profil lewat file atau kamera.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Nama Lengkap */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition ${
                  isFieldEditable("name")
                    ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                    : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                }`}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Alamat Email (Akun)
              </label>
              
              {statusAccount !== "active" && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Belum Verifikasi
                  </span>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-[9px] font-bold text-teal-700 hover:underline transition cursor-pointer disabled:opacity-50"
                  >
                    {resendLoading ? "..." : "Kirim Link"}
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 font-medium cursor-not-allowed font-mono"
              />
              {statusAccount === "active" && (
                <CheckCircle className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500" />
              )}
            </div>
          </div>

           {/* NIK */}
           <div>
             <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
                 className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition ${
                   !isNikFilledOnLoad && isFieldEditable("nik")
                     ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                     : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                 }`}
                 placeholder={user?.role === "rumah_sakit" || user?.role === "faskes" ? "Masukkan SIP" : "3171010509840002"}
               />
               {isNikFilledOnLoad && (
                 <CheckCircle className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500" />
               )}
             </div>
           </div>

           {/* Nomor Telepon */}
           <div>
             <div className="flex items-center justify-between mb-1.5">
               <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
                 className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition ${
                   isFieldEditable("phone")
                     ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition ${
                      isFieldEditable("dateOfBirth")
                        ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden cursor-pointer"
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
                              className={`py-1.5 rounded-lg font-semibold hover:bg-teal-50 transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#0D9488] text-white hover:bg-[#0D9488]"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Jenis Kelamin
                  </label>
                </div>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  disabled={!isFieldEditable("sex")}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition ${
                    isFieldEditable("sex")
                      ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
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
           <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition ${
                isFieldEditable("address")
                  ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                  : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Geotagging coordinates for Hospital/Faskes */}
        {(user?.role === "rumah_sakit" || user?.role === "faskes") && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Latitude
                </label>
              </div>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={!isFieldEditable("latitude")}
                placeholder="-6.8837"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition font-mono ${
                  isFieldEditable("latitude")
                    ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                    : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Longitude
                </label>
              </div>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={!isFieldEditable("longitude")}
                placeholder="107.6049"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition font-mono ${
                  isFieldEditable("longitude")
                    ? "border-slate-300 bg-white text-slate-900 focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                    : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
