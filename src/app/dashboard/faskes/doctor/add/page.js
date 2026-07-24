"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../layout/Navbar";
import Sidebar from "../../../layout/Sidebar";
import { createDoctor } from "@/lib/doctorService";
import {
  Users,
  Building2,
  RefreshCw,
  CheckCircle,
  Briefcase,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  Camera,
  Upload,
  X,
  Move
} from "lucide-react";

const DAYS_OF_WEEK = [
  { key: "Senin", label: "Senin" },
  { key: "Selasa", label: "Selasa" },
  { key: "Rabu", label: "Rabu" },
  { key: "Kamis", label: "Kamis" },
  { key: "Jumat", label: "Jumat" },
  { key: "Sabtu", label: "Sabtu" },
  { key: "Minggu", label: "Minggu" }
];

export default function FaskesAddDoctor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    specialist: "",
    medical_license: "",
    phone: "",
    sex: "pilihan",
    status: "status"
  });

  // Daily schedules: can set custom hours per day
  const [dailySchedules, setDailySchedules] = useState({
    Senin: { active: false, start: "08:00", end: "16:00" },
    Selasa: { active: false, start: "08:00", end: "16:00" },
    Rabu: { active: false, start: "08:00", end: "16:00" },
    Kamis: { active: false, start: "08:00", end: "16:00" },
    Jumat: { active: false, start: "08:00", end: "16:00" },
    Sabtu: { active: false, start: "08:00", end: "16:00" },
    Minggu: { active: false, start: "08:00", end: "16:00" }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

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
      
      // Draw mirrored video frame
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSourceImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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
          const file = new File([blob], "cropped-doctor-photo.jpg", { type: "image/jpeg" });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
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

  const handleDayToggle = (dayKey) => {
    setDailySchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: !prev[dayKey].active
      }
    }));
  };

  const handleTimeChange = (dayKey, type, value) => {
    setDailySchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [type]: value
      }
    }));
  };

  const formatSchedule = (schedules) => {
    const activeDays = Object.keys(schedules).filter((d) => schedules[d].active);
    if (activeDays.length === 0) return "Belum ditentukan";

    const parts = activeDays.map((d) => {
      const { start, end } = schedules[d];
      return `${d} (${start} - ${end})`;
    });

    return parts.join(", ");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialist || !formData.medical_license) {
      alert("Harap isi field utama (Nama, Spesialisasi, No Izin)");
      return;
    }
    if (formData.sex === "pilihan") {
      alert("Harap pilih jenis kelamin dokter");
      return;
    }
    
    const activeDays = Object.keys(dailySchedules).filter((d) => dailySchedules[d].active);
    if (activeDays.length === 0) {
      alert("Harap pilih setidaknya satu hari praktik");
      return;
    }
    setSubmitting(true);

    try {
      const formattedSchedule = formatSchedule(dailySchedules);
      const res = await createDoctor({
        ...formData,
        practice_schedule: formattedSchedule,
        imageFile
      });
      if (res.success) {
        alert("Dokter berhasil ditambahkan!");
        router.push("/dashboard/faskes/doctor/list");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan data dokter");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-rose-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <button onClick={() => router.push("/auth/login")} className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-850 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
          {/* Header Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200">
                <UserPlus className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Dokter Baru</h1>
                <p className="text-xs text-slate-500 mt-0.5">Daftarkan tenaga medis baru ke dalam database fasilitas kesehatan Anda.</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Doctor Profile Info (Span 7) */}
                <div className="lg:col-span-7 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">
                    Informasi Profil Dokter
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Foto Dokter (Klik bingkai untuk mengubah)</label>
                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 w-fit">
                      <div 
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="group relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0 cursor-pointer hover:border-rose-800 transition duration-200"
                        title="Klik untuk mengubah foto"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-rose-50/50 text-rose-800 text-[10px] font-bold">
                            No Photo
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-700">Frame Foto Profil</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Klik kotak untuk upload foto baru atau ambil gambar lewat kamera.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Lengkap Dokter</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap dokter"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Spesialisasi / Poli</label>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan spesialisasi / poliklinik dokter"
                        value={formData.specialist}
                        onChange={(e) => setFormData({ ...formData, specialist: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No Izin SIP</label>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan nomor SIP dokter"
                        value={formData.medical_license}
                        onChange={(e) => setFormData({ ...formData, medical_license: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        placeholder="Masukkan nomor telepon dokter"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jenis Kelamin</label>
                      <select
                        value={formData.sex}
                        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                      >
                        <option value="pilihan">Pilih Jenis Kelamin</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                    >
                      <option value="status">Pilih Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Custom Daily Scheduler (Span 5) */}
                <div className="lg:col-span-5 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">
                    Kustomisasi Jadwal Praktik Harian
                  </h3>
                  
                  <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-4">
                    <div className="divide-y divide-slate-200/60 pr-1 max-h-80 overflow-y-auto">
                      {DAYS_OF_WEEK.map((day) => {
                        const sched = dailySchedules[day.key];
                        return (
                          <div key={day.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                            <button
                              type="button"
                              onClick={() => handleDayToggle(day.key)}
                              className={`h-8 px-4 rounded-full text-xs font-bold transition border cursor-pointer select-none ${
                                sched.active
                                  ? "bg-rose-800 text-white border-rose-900 shadow-xs"
                                  : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {day.key}
                            </button>

                            {sched.active ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={sched.start}
                                  onChange={(e) => handleTimeChange(day.key, "start", e.target.value)}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:border-rose-800 focus:outline-hidden bg-white font-semibold text-slate-700"
                                />
                                <span className="text-slate-400 text-xs">-</span>
                                <input
                                  type="time"
                                  value={sched.end}
                                  onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:border-rose-800 focus:outline-hidden bg-white font-semibold text-slate-700"
                                />
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-medium">Libur / Tidak Praktik</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium pt-3.5 border-t border-slate-200/60 flex items-center flex-wrap gap-1.5">
                      <span className="font-bold text-slate-700">Hasil Format Jadwal:</span>
                      <span className="font-mono text-rose-900 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded-lg border border-rose-100/50 text-[10px] break-all leading-normal">
                        {formatSchedule(dailySchedules)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/faskes/doctor/list")}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Registrasi Dokter
                </button>
              </div>
            </form>
          </div>
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
                Atur Foto Dokter
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
                  className="relative h-60 w-60 rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-inner cursor-move select-none"
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
