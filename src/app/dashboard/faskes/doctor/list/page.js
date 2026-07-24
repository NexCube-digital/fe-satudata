"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../layout/Navbar";
import Sidebar from "../../../layout/Sidebar";
import {
  getDoctors,
  updateDoctor,
  deleteDoctor
} from "@/lib/doctorService";
import {
  Users,
  Building2,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  User,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  Sparkles,
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

export default function FaskesDoctorsList() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Only for Edit in this list page)
  const [formData, setFormData] = useState({
    name: "",
    specialist: "",
    medical_license: "",
    phone: "",
    sex: "laki-laki",
    status: "Aktif"
  });

  // Daily schedules: can set custom hours per day
  const [dailySchedules, setDailySchedules] = useState({
    Senin: { active: true, start: "08:00", end: "16:00" },
    Selasa: { active: true, start: "08:00", end: "16:00" },
    Rabu: { active: true, start: "08:00", end: "16:00" },
    Kamis: { active: true, start: "08:00", end: "16:00" },
    Jumat: { active: true, start: "08:00", end: "16:00" },
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
    fetchDoctorsList();
  }, []);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error("Error loading doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const parseSchedule = (scheduleStr) => {
    const defaultSchedules = {
      Senin: { active: false, start: "08:00", end: "16:00" },
      Selasa: { active: false, start: "08:00", end: "16:00" },
      Rabu: { active: false, start: "08:00", end: "16:00" },
      Kamis: { active: false, start: "08:00", end: "16:00" },
      Jumat: { active: false, start: "08:00", end: "16:00" },
      Sabtu: { active: false, start: "08:00", end: "16:00" },
      Minggu: { active: false, start: "08:00", end: "16:00" }
    };

    if (!scheduleStr) return defaultSchedules;

    try {
      if (scheduleStr.includes("(") && scheduleStr.includes(")")) {
        const result = {
          Senin: { active: false, start: "08:00", end: "16:00" },
          Selasa: { active: false, start: "08:00", end: "16:00" },
          Rabu: { active: false, start: "08:00", end: "16:00" },
          Kamis: { active: false, start: "08:00", end: "16:00" },
          Jumat: { active: false, start: "08:00", end: "16:00" },
          Sabtu: { active: false, start: "08:00", end: "16:00" },
          Minggu: { active: false, start: "08:00", end: "16:00" }
        };

        const parts = scheduleStr.split(",");
        parts.forEach((p) => {
          const trimmed = p.trim();
          const match = trimmed.match(/^([A-Za-z]+)\s*\(([^)]+)\)$/);
          if (match) {
            const dayName = match[1].trim();
            const timeRange = match[2].trim();
            const timeSub = timeRange.split("-");
            if (result[dayName]) {
              result[dayName].active = true;
              if (timeSub.length >= 2) {
                result[dayName].start = timeSub[0].trim();
                result[dayName].end = timeSub[1].trim();
              }
            }
          }
        });
        return result;
      }

      const parts = scheduleStr.split(",");
      if (parts.length < 2) return defaultSchedules;

      const daysPart = parts[0].trim();
      const timePart = parts[1].trim();

      const timeSubparts = timePart.split("-");
      let start = "08:00";
      let end = "16:00";
      if (timeSubparts.length >= 2) {
        start = timeSubparts[0].trim();
        end = timeSubparts[1].trim();
      }

      let activeDays = [];
      if (daysPart.toLowerCase() === "setiap hari") {
        activeDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
      } else if (daysPart.toLowerCase() === "senin - jumat" || daysPart.toLowerCase() === "senin-jumat") {
        activeDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
      } else {
        activeDays = daysPart.split(",").map(d => d.trim()).filter(Boolean);
      }

      const result = {
        Senin: { active: false, start: "08:00", end: "16:00" },
        Selasa: { active: false, start: "08:00", end: "16:00" },
        Rabu: { active: false, start: "08:00", end: "16:00" },
        Kamis: { active: false, start: "08:00", end: "16:00" },
        Jumat: { active: false, start: "08:00", end: "16:00" },
        Sabtu: { active: false, start: "08:00", end: "16:00" },
        Minggu: { active: false, start: "08:00", end: "16:00" }
      };

      activeDays.forEach((d) => {
        if (result[d]) {
          result[d].active = true;
          result[d].start = start;
          result[d].end = end;
        }
      });

      return result;
    } catch (e) {
      console.error("Failed to parse schedule string:", e);
      return defaultSchedules;
    }
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

  const openEditModal = (doctor) => {
    setFormData({
      name: doctor.name || "",
      specialist: doctor.specialist || "",
      medical_license: doctor.medical_license || "",
      phone: doctor.phone || "",
      sex: doctor.sex || "laki-laki",
      status: doctor.status || "Aktif"
    });

    const imgUrl = doctor.image
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/public/upload/doctors/${doctor.image}`
      : null;
    setImagePreview(imgUrl);
    setImageFile(null);

    const parsed = parseSchedule(doctor.practice_schedule);
    setDailySchedules(parsed);

    setSelectedDoctorId(doctor.id);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialist || !formData.medical_license) {
      alert("Harap isi field utama (Nama, Spesialisasi, No Izin)");
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
      const res = await updateDoctor({ 
        ...formData, 
        id: selectedDoctorId,
        practice_schedule: formattedSchedule,
        imageFile
      });
      if (res.success) {
        alert("Data dokter berhasil diperbarui!");
        fetchDoctorsList();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan data dokter");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data dokter ${name}?`)) {
      return;
    }
    try {
      const res = await deleteDoctor(id);
      if (res.success) {
        alert("Data dokter berhasil dihapus!");
        fetchDoctorsList();
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data dokter");
    }
  };

  if (loading && doctors.length === 0) {
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

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-rose-700/10 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Users className="h-8 w-8 text-rose-400" />
                  Daftar Tenaga Medis (Dokter)
                </h1>
                <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
                  Daftar staf dokter penanggung jawab poliklinik di instansi Anda. Tautkan dokter untuk keperluan otorisasi rekam medis (EHR) terenkripsi.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/faskes/doctor/add")}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-700 hover:bg-rose-400 text-white font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition shrink-0 cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Tambah Dokter Baru
              </button>
            </div>
          </div>

          {/* Doctor Cards Grid */}
          {doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Dokter Terdaftar</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-6">Tambahkan dokter baru untuk menghubungkannya dengan unit medis.</p>
              <button
                onClick={() => router.push("/dashboard/faskes/doctor/add")}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-4 py-2.5 text-xs transition cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Mulai Tambah Dokter
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div>
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-700 to-rose-800 flex items-center justify-center text-white font-extrabold text-sm shadow-sm overflow-hidden shrink-0">
                          {doctor.image ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/public/upload/doctors/${doctor.image}`}
                              alt={doctor.name}
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            doctor.name ? doctor.name.replace("Dr.", "").trim().charAt(0).toUpperCase() : "D"
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{doctor.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-md mt-1 border border-rose-100/50">
                            <Briefcase className="h-3 w-3" /> {doctor.specialist}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        doctor.status === "Aktif"
                          ? "bg-rose-50 border-emerald-250 text-rose-900"
                          : "bg-slate-50 border-slate-250 text-slate-650"
                      }`}>
                        {doctor.status || "Aktif"}
                      </span>
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-2 py-3 border-t border-slate-100/80 text-[11px] text-slate-650 font-medium">
                      <p className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-400">Lisensi SIP:</span> <span className="font-mono text-slate-700">{doctor.medical_license}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-slate-400">Jadwal:</span>
                          <span className="text-slate-700 text-[10px] leading-relaxed break-words max-w-[190px]">
                            {doctor.practice_schedule || "Senin-Jumat"}
                          </span>
                        </div>
                      </p>
                      {doctor.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-400">Telepon:</span> <span className="text-slate-700">{doctor.phone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-400">Gender:</span> <span className="capitalize text-slate-700">{doctor.sex || "Laki-laki"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100/80 mt-4">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 p-2.5 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CRUD Doctor Modal (Only for Edit Mode) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 sm:p-8 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-rose-800" />
                  Edit Profil Dokter
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi dokter di bawah ini.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-sm cursor-pointer"
              >
                Tutup [X]
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Doctor Profile Info (Span 7) */}
                <div className="lg:col-span-7 space-y-4">
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
                      placeholder="Contoh: Dr. Sarah Wijaya"
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
                        placeholder="Contoh: Kardiologi"
                        value={formData.specialist}
                        onChange={(e) => setFormData({ ...formData, specialist: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden bg-white text-slate-850"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No Izin SIP (Medical License)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: SIP-2026-987"
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
                        placeholder="0812XXXXXXXX"
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
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Custom Daily Scheduler (Span 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Kustomisasi Jadwal Praktik Harian
                  </label>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-4">
                    <div className="divide-y divide-slate-200/60 pr-1 max-h-60 overflow-y-auto">
                      {DAYS_OF_WEEK.map((day) => {
                        const sched = dailySchedules[day.key];
                        return (
                          <div key={day.key} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-4">
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
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
