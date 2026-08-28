"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  getDoctors,
  updateDoctor,
  deleteDoctor
} from "@/services/doctorService";
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
  Move,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Check
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialistFilter, setSelectedSpecialistFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Doctor Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDoctorForDetail, setSelectedDoctorForDetail] = useState(null);

  const openDetailModal = (doctor) => {
    setSelectedDoctorForDetail(doctor);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    const docToEdit = selectedDoctorForDetail;
    setIsDetailModalOpen(false);
    if (docToEdit) {
      openEditModal(docToEdit);
    }
  };

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

  // Helper to format full doctor photo URL
  const getDoctorImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    if (img.startsWith("/")) return `${baseUrl}${img}`;
    return `${baseUrl}/public/upload/doctors/${img}`;
  };

  // Modern Dropdown Component
  function ModernFilterSelect({ options, value, onChange, icon: Icon, placeholder = "Pilih..." }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      function handleClickOutside(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
      <div ref={ref} className="relative min-w-[160px] flex-1 sm:flex-none">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
            open
              ? "border-primary bg-secondary-tint/40 ring-2 ring-teal-200/50 shadow-xs"
              : value !== "ALL"
              ? "border-teal-300 bg-secondary-tint/30 text-primary"
              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-white"
          }`}
        >
          <span className="flex items-center gap-2 min-w-0 truncate">
            {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${value !== "ALL" ? "text-primary" : "text-slate-400"}`} />}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 z-50 min-w-[200px] sm:min-w-[240px] w-max max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-secondary-tint text-primary"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="leading-snug">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

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

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isDetailModalOpen || isModalOpen || isPhotoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailModalOpen, isModalOpen, isPhotoModalOpen]);

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

  // Extract unique specialists for dropdown filter
  const availableSpecialists = Array.from(
    new Set(doctors.map((d) => d.specialist).filter(Boolean))
  );

  // Filtered doctors list
  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (doctor.name && doctor.name.toLowerCase().includes(query)) ||
      (doctor.specialist && doctor.specialist.toLowerCase().includes(query)) ||
      (doctor.medical_license && doctor.medical_license.toLowerCase().includes(query));

    const matchesSpecialist =
      selectedSpecialistFilter === "ALL" || doctor.specialist === selectedSpecialistFilter;

    const matchesStatus =
      selectedStatusFilter === "ALL" || (doctor.status || "Aktif") === selectedStatusFilter;

    return matchesSearch && matchesSpecialist && matchesStatus;
  });

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

    const imgUrl = getDoctorImageUrl(doctor.image);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <button onClick={() => router.push("/auth/login")} className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover transition">
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-5 py-4 text-white shadow-md mb-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <Users className="h-6 w-6 text-teal-200" />
                  Daftar Tenaga Medis (Dokter)
                </h1>
                <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                  Daftar staf dokter penanggung jawab poliklinik di instansi Anda. Tautkan dokter untuk otorisasi rekam medis (EHR).
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/faskes/doctor/add")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-primary-hover hover:bg-teal-50 font-bold px-4 py-2.5 text-xs shadow-xs transition shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Dokter Baru
              </button>
            </div>
          </div>

          {/* Search & Dropdown Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama dokter, spesialis, atau SIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs placeholder:text-slate-400 focus:bg-white focus:border-primary focus:outline-hidden transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Specialist */}
              <ModernFilterSelect
                icon={Briefcase}
                value={selectedSpecialistFilter}
                onChange={setSelectedSpecialistFilter}
                options={[
                  { value: "ALL", label: "Semua Spesialis" },
                  ...availableSpecialists.map((spec) => ({ value: spec, label: spec }))
                ]}
              />

              {/* Filter Status */}
              <ModernFilterSelect
                icon={Filter}
                value={selectedStatusFilter}
                onChange={setSelectedStatusFilter}
                options={[
                  { value: "ALL", label: "Semua Status" },
                  { value: "Aktif", label: "Aktif" },
                  { value: "Tidak Aktif", label: "Tidak Aktif" }
                ]}
              />

              {/* Reset Filter Button */}
              {(searchQuery || selectedSpecialistFilter !== "ALL" || selectedStatusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecialistFilter("ALL");
                    setSelectedStatusFilter("ALL");
                  }}
                  className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 transition cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          {doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Dokter Terdaftar</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-6">Tambahkan dokter baru untuk menghubungkannya dengan unit medis.</p>
              <button
                onClick={() => router.push("/dashboard/faskes/doctor/add")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 text-xs transition cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Mulai Tambah Dokter
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Dokter Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Tidak ada dokter yang cocok dengan kriteria kata kunci atau filter Anda.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialistFilter("ALL");
                  setSelectedStatusFilter("ALL");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary-tint text-primary hover:bg-teal-100 font-bold px-4 py-2 text-xs transition cursor-pointer border border-teal-200"
              >
                Bersihkan Pencarian
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between overflow-hidden group">
                  <div>
                    {/* 1. Foto Dokter Besar */}
                    <div className="relative h-56 sm:h-60 lg:h-64 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 flex items-center justify-center">
                      {getDoctorImageUrl(doctor.image) ? (
                        <img
                          src={getDoctorImageUrl(doctor.image)}
                          alt={doctor.name}
                          className="h-full w-full object-contain p-1 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-800 to-emerald-950 text-white text-5xl font-black opacity-80">
                          {doctor.name ? doctor.name.replace(/^dr\.\s*/i, "").trim().charAt(0).toUpperCase() : "D"}
                        </div>
                      )}

                      {/* Status Badge overlay */}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-2xs border backdrop-blur-md ${
                        doctor.status === "Aktif"
                          ? "bg-primary text-white border-teal-600"
                          : "bg-slate-700/90 text-slate-200 border-slate-600/30"
                      }`}>
                        {doctor.status || "Aktif"}
                      </span>
                    </div>

                    {/* 2. Nama Dokter (Fixed height container for 100% consistent alignment) */}
                    <div className="mb-2 h-12 flex items-start">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug line-clamp-2" title={doctor.name}>
                        {doctor.name}
                      </h4>
                    </div>

                    {/* 3. Badge Spesialis (Fixed height container for 100% consistent alignment) */}
                    <div className="h-7 flex items-center mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-secondary-tint px-2.5 py-1 rounded-lg border border-teal-200 max-w-full truncate">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{doctor.specialist}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4. Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => openDetailModal(doctor)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary-tint hover:bg-teal-100 text-primary border border-teal-200 py-2.5 text-xs font-bold transition cursor-pointer"
                    >
                      <Eye className="h-4 w-4" /> Lihat Detail
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-2.5 transition cursor-pointer"
                      title="Hapus Dokter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Dokter Modal */}
      {isDetailModalOpen && selectedDoctorForDetail && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Detail Profil Dokter</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Side-by-Side Content: Large Photo on Left, Details on Right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start mb-6">
              
              {/* LEFT: Large Doctor Photo Container (Span 5) */}
              <div className="sm:col-span-5 relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                {getDoctorImageUrl(selectedDoctorForDetail.image) ? (
                  <img
                    src={getDoctorImageUrl(selectedDoctorForDetail.image)}
                    alt={selectedDoctorForDetail.name}
                    className="h-full w-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-800 to-emerald-950 text-white text-4xl font-black">
                    {selectedDoctorForDetail.name ? selectedDoctorForDetail.name.replace(/^dr\.\s*/i, "").trim().charAt(0).toUpperCase() : "D"}
                  </div>
                )}
                
                {/* Status Badge overlay */}
                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold shadow-2xs border backdrop-blur-md ${
                  selectedDoctorForDetail.status === "Aktif"
                    ? "bg-primary text-white border-teal-600"
                    : "bg-slate-700/90 text-slate-200 border-slate-600/30"
                }`}>
                  {selectedDoctorForDetail.status || "Aktif"}
                </span>
              </div>

              {/* RIGHT: Name, Specialist & Details List (Span 7) */}
              <div className="sm:col-span-7 space-y-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight mb-2">
                    {selectedDoctorForDetail.name}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-secondary-tint px-3 py-1 rounded-lg border border-teal-200">
                    <Briefcase className="h-3.5 w-3.5" /> {selectedDoctorForDetail.specialist}
                  </span>
                </div>

                <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Lisensi SIP:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedDoctorForDetail.medical_license || "-"}</span>
                  </div>

                  <div className="flex justify-between items-start py-1 border-b border-slate-200/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Jadwal Praktik:</span>
                    <span className="text-slate-800 font-semibold text-right leading-snug max-w-[180px]">
                      {selectedDoctorForDetail.practice_schedule || "Senin-Jumat 09:00-16:00"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Telepon:</span>
                    <span className="text-slate-800 font-semibold">{selectedDoctorForDetail.phone || "-"}</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gender:</span>
                    <span className="capitalize text-slate-800 font-semibold">{selectedDoctorForDetail.sex || "Laki-laki"}</span>
                  </div>
                </div>

                {/* Edit Profil Button directly under Gender */}
                <button
                  type="button"
                  onClick={handleEditFromDetail}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white py-2.5 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profil
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* CRUD Doctor Modal (Only for Edit Mode) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 sm:p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-primary" />
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
                    <div className="flex items-center gap-4 bg-secondary-tint/50 p-4 rounded-2xl border border-teal-200/60 w-fit">
                      <div 
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="group relative h-24 w-24 rounded-2xl overflow-hidden bg-primary border border-teal-600 shadow-2xs shrink-0 cursor-pointer hover:border-teal-400 transition duration-200"
                        title="Klik untuk mengubah foto"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover object-top" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary text-white text-[10px] font-bold">
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
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
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
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
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
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
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
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jenis Kelamin</label>
                      <select
                        value={formData.sex}
                        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
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
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-primary focus:outline-hidden bg-white text-slate-800"
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
                                  ? "bg-primary text-white border-teal-700 shadow-xs"
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
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:border-primary focus:outline-hidden bg-white font-semibold text-slate-700"
                                />
                                <span className="text-slate-400 text-xs">-</span>
                                <input
                                  type="time"
                                  value={sched.end}
                                  onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:border-primary focus:outline-hidden bg-white font-semibold text-slate-700"
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
                      <span className="font-mono text-primary font-bold bg-secondary-tint px-2.5 py-0.5 rounded-lg border border-teal-200 text-[10px] break-all leading-normal">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer"
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
        <div 
          className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => {
            stopCamera();
            setIsPhotoModalOpen(false);
            setSourceImage(null);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Atur Foto Dokter
              </h3>
              <button
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  stopCamera();
                }}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 border-dashed border-teal-200 bg-secondary-tint text-primary font-bold hover:bg-teal-100 transition text-xs cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-primary" />
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
                  <Camera className="h-5 w-5 text-slate-500" />
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
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition cursor-pointer"
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex gap-2 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleCropSave}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
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
