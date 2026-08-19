'use client';

import React from 'react';
import {
  User as UserIcon,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/api-client';

export const ProfilMobile = ({
  user,
  name,
  setName,
  email,
  nik,
  setNik,
  phone,
  setPhone,
  address,
  setAddress,
  dateOfBirth,
  setDateOfBirth,
  sex,
  setSex,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  statusAccount,
  resendLoading,
  handleResendVerification,
  isEditMode,
  setIsEditMode,
  isFieldEditable,
  hasChanges,
  profileLoading,
  profileMsg,
  handleUpdateProfile,
  handleCancelEdit,
  profilePicturePreview,
  setIsPhotoModalOpen,
  showDatePicker,
  setShowDatePicker,
  viewDate,
  setViewDate,
  onBack,
}) => {
  const enableEdit = () => {
    if (!isEditMode) setIsEditMode(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      {/* Fixed Flushed Top Header Navigation */}
      <div className="sticky top-0 z-40 -mt-8 -mx-4 pt-4 px-4 pb-3 bg-[#faf7f2] border-b border-slate-200/90 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-800">Profil Pengguna</h2>
            <p className="text-[11px] text-slate-500">Kelola identitas dan data pribadi Anda</p>
          </div>
        </div>

        {/* Top Right Save Button */}
        <button
          type="button"
          onClick={(e) => {
            enableEdit();
            handleUpdateProfile(e);
          }}
          disabled={profileLoading || !hasChanges}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition cursor-pointer ${
            hasChanges
              ? 'bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
          }`}
        >
          {profileLoading ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Simpan</span>
        </button>
      </div>

      {profileMsg?.text && (
        <div
          className={`flex items-center gap-3 rounded-xl p-3 text-xs ${
            profileMsg.type === 'success'
              ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
              : 'bg-rose-50 text-[#DC2626] border border-rose-200'
          }`}
        >
          {profileMsg.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          )}
          <span>{profileMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        {/* Avatar Box */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
          <div
            onClick={() => {
              enableEdit();
              setIsPhotoModalOpen(true);
            }}
            className="group relative h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-teal-700 to-cyan-800 ring-4 ring-teal-500/20 shrink-0 shadow-md cursor-pointer hover:brightness-95 transition"
          >
            {profilePicturePreview || getAvatarUrl(user) ? (
              <img
                src={profilePicturePreview || getAvatarUrl(user)}
                alt="Foto Profil"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {name ? name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
              </div>
            )}
            {isEditMode && (
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                <Camera className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800">Foto Profil Akun</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ketuk foto di atas untuk mengganti foto profil.
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {user?.role === 'rumah_sakit' || user?.role === 'faskes' ? 'Nama Instansi / Faskes' : 'Nama Lengkap'}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onFocus={enableEdit}
                onChange={(e) => {
                  enableEdit();
                  setName(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-teal-600/80 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20 outline-hidden transition"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Alamat Email (Akun)
              </label>

              {statusAccount !== 'active' && (
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                    <AlertCircle className="h-2.5 w-2.5 text-[#D97706]" />
                    Belum Verif
                  </span>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-[9px] font-bold text-teal-800 hover:underline cursor-pointer"
                  >
                    {resendLoading ? '...' : 'Kirim Ulang'}
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
              {statusAccount === 'active' && (
                <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-[#16A34A] shrink-0" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {user?.role === 'rumah_sakit' || user?.role === 'faskes' ? 'Surat Izin Praktik / NOP' : 'NIK Pasien'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={nik}
                onFocus={enableEdit}
                onChange={(e) => {
                  enableEdit();
                  setNik(e.target.value);
                }}
                disabled={!isFieldEditable('nik')}
                placeholder="3273123456789000"
                className={`w-full pl-3.5 pr-9 py-2 rounded-xl border text-xs transition ${
                  isFieldEditable('nik')
                    ? 'border-teal-600/80 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500/20 outline-hidden'
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                }`}
              />
              {nik && (
                <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-[#16A34A] shrink-0" />
              )}
            </div>
          </div>

          {user?.role !== 'staf_rs' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onFocus={enableEdit}
                  onChange={(e) => {
                    enableEdit();
                    setPhone(e.target.value);
                  }}
                  placeholder="+62 812 3456 7890"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-teal-600/80 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20 outline-hidden transition"
                />
                {phone && (
                  <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-[#16A34A] shrink-0" />
                )}
              </div>
            </div>
          )}

          {user?.role === 'pasien' && (
            <>
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tanggal Lahir
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Pilih Tanggal Lahir"
                    value={
                      dateOfBirth
                        ? new Date(dateOfBirth).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''
                    }
                    onClick={() => {
                      enableEdit();
                      setShowDatePicker(!showDatePicker);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-teal-600/80 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20 outline-hidden cursor-pointer transition"
                  />
                </div>

                {showDatePicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                    <div className="absolute left-0 bottom-full mb-2 p-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between gap-1 mb-3">
                        <select
                          value={viewDate.getMonth()}
                          onChange={(e) => {
                            const newD = new Date(viewDate);
                            newD.setMonth(parseInt(e.target.value));
                            setViewDate(newD);
                          }}
                          className="text-xs font-bold text-slate-700 border border-slate-200 rounded-lg p-1 bg-white"
                        >
                          {[
                            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
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
                          className="text-xs font-bold text-slate-700 border border-slate-200 rounded-lg p-1 bg-white"
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
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
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
                          const formattedMonth = String(viewDate.getMonth() + 1).padStart(2, '0');
                          const formattedDay = String(dayNum).padStart(2, '0');
                          const isSelected =
                            dateOfBirth === `${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

                          return (
                            <button
                              key={`day-${dayNum}`}
                              type="button"
                              onClick={() => {
                                enableEdit();
                                setDateOfBirth(`${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`);
                                setShowDatePicker(false);
                              }}
                              className={`py-1.5 rounded-lg font-semibold hover:bg-teal-50 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white'
                                  : 'text-slate-700'
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={sex}
                  onFocus={enableEdit}
                  onChange={(e) => {
                    enableEdit();
                    setSex(e.target.value);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-600/80 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20 outline-hidden transition"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </>
          )}

          {user?.role !== 'staf_rs' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {user?.role === 'rumah_sakit' || user?.role === 'faskes' ? 'Alamat Instansi / Faskes' : 'Alamat Tempat Tinggal'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onFocus={enableEdit}
                  onChange={(e) => {
                    enableEdit();
                    setAddress(e.target.value);
                  }}
                  placeholder="Jl. Raya Kebon Jeruk No. 12"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-teal-600/80 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20 outline-hidden transition"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfilMobile;
