"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Key, 
  AlertCircle,
  Save,
  RefreshCw,
  Lock,
  Building2,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Check,
  UserCheck
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const DEPARTMENT_UNITS = [
  { id: "ALL", label: "Semua Unit" },
  { id: "Rehab Medik", label: "Rehab Medik", icon: "♿" },
  { id: "ICU", label: "ICU", icon: "🫀" },
  { id: "Radiologi", label: "Radiologi", icon: "🩻" },
  { id: "Laboratorium", label: "Laboratorium", icon: "🔬" },
  { id: "IGD", label: "IGD", icon: "🚑" },
  { id: "Rawat Inap", label: "Rawat Inap", icon: "🛏️" },
  { id: "Rawat Jalan", label: "Rawat Jalan", icon: "🏥" },
  { id: "Bedah/OKA", label: "Bedah / OKA", icon: "🔪" }
];

export default function FaskesStaffManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("staffs"); // "staffs" | "matrix"
  
  // Data States
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({ raw: [], grouped: {} });
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [notification, setNotification] = useState(null);

  // Selected Role for Matrix Edit
  const [selectedRole, setSelectedRole] = useState(null);
  const [matrixChecklist, setMatrixChecklist] = useState([]);

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Form States
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    hospital_role_id: "",
    position: ""
  });
  
  const [editStaffForm, setEditStaffForm] = useState({
    id: null,
    name: "",
    hospital_role_id: "",
    position: "",
    status: "active",
    password: ""
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permission_ids: []
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [permsRes, rolesRes, staffsRes] = await Promise.all([
        apiGet("/api/hospital/permissions"),
        apiGet("/api/hospital/roles"),
        apiGet("/api/hospital/staffs")
      ]);

      if (permsRes.success && permsRes.data) {
        setPermissions(permsRes.data);
      }
      
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0 && !selectedRole) {
          setSelectedRole(rolesRes.data[0]);
          setMatrixChecklist(rolesRes.data[0].permissions?.map(p => p.id) || []);
        }
      }

      if (staffsRes.success && staffsRes.data) {
        setStaffs(staffsRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      showNotification("error", "Gagal memuat data staf dan role.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update matrix checklist saat selectedRole berganti
  useEffect(() => {
    if (selectedRole) {
      const activeRole = roles.find(r => r.id === selectedRole.id) || selectedRole;
      setMatrixChecklist(activeRole.permissions?.map(p => p.id) || []);
    }
  }, [selectedRole, roles]);

  // Handle Add Staff Submit
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiPost("/api/hospital/staffs", staffForm);
      if (res.success) {
        showNotification("success", "Akun staf RS berhasil ditambahkan!");
        setIsAddStaffOpen(false);
        setStaffForm({ name: "", email: "", password: "", hospital_role_id: "", position: "" });
        fetchData();
      } else {
        showNotification("error", res.message || "Gagal menambahkan staf");
      }
    } catch (err) {
      showNotification("error", err.message || "Terjadi kesalahan server");
    }
  };

  // Handle Edit Staff Submit
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editStaffForm.name,
        hospital_role_id: editStaffForm.hospital_role_id,
        position: editStaffForm.position,
        status: editStaffForm.status
      };
      if (editStaffForm.password) {
        payload.password = editStaffForm.password;
      }
      
      const res = await apiPut(`/api/hospital/staffs/${editStaffForm.id}`, payload);
      if (res.success) {
        showNotification("success", "Data staf berhasil diperbarui!");
        setIsEditStaffOpen(false);
        fetchData();
      } else {
        showNotification("error", res.message || "Gagal memperbarui staf");
      }
    } catch (err) {
      showNotification("error", err.message || "Terjadi kesalahan server");
    }
  };

  // Handle Add Role Submit
  const handleAddRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiPost("/api/hospital/roles", roleForm);
      if (res.success) {
        showNotification("success", `Role '${roleForm.name}' berhasil dibuat!`);
        setIsAddRoleOpen(false);
        setRoleForm({ name: "", description: "", permission_ids: [] });
        fetchData();
      } else {
        showNotification("error", res.message || "Gagal membuat role");
      }
    } catch (err) {
      showNotification("error", err.message || "Terjadi kesalahan server");
    }
  };

  // Handle Save Matrix Permissions
  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setSavingMatrix(true);
    try {
      const res = await apiPut(`/api/hospital/roles/${selectedRole.id}`, {
        permission_ids: matrixChecklist
      });
      if (res.success) {
        showNotification("success", `Hak akses untuk role '${selectedRole.name}' berhasil disimpan!`);
        fetchData();
      } else {
        showNotification("error", res.message || "Gagal menyimpan hak akses");
      }
    } catch (err) {
      showNotification("error", err.message || "Terjadi kesalahan server");
    } finally {
      setSavingMatrix(false);
    }
  };

  const togglePermissionCheck = (permId) => {
    setMatrixChecklist(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleCategoryCheck = (categoryPerms) => {
    const permIds = categoryPerms.map(p => p.id);
    const allChecked = permIds.every(id => matrixChecklist.includes(id));

    if (allChecked) {
      setMatrixChecklist(prev => prev.filter(id => !permIds.includes(id)));
    } else {
      setMatrixChecklist(prev => Array.from(new Set([...prev, ...permIds])));
    }
  };

  const filteredStaffs = staffs.filter((s: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      s.user?.name?.toLowerCase().includes(term) ||
      s.user?.email?.toLowerCase().includes(term) ||
      s.position?.toLowerCase().includes(term) ||
      s.role?.name?.toLowerCase().includes(term);

    const matchesUnit = selectedUnit === "ALL" || 
      s.role?.name?.toLowerCase().includes(selectedUnit.toLowerCase()) ||
      s.position?.toLowerCase().includes(selectedUnit.toLowerCase());

    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-6">
      {/* Top Navbar */}
      

      <div>
        {/* Left Sidebar */}
        

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Toast Notification */}
          {notification && (
            <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all duration-300 ${
              notification.type === "success" 
                ? "bg-emerald-900 text-emerald-100 border border-emerald-700" 
                : "bg-red-900 text-red-100 border border-red-700"
            }`}>
              {notification.type === "success" ? <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> : <AlertCircle className="h-4 w-4 text-[#DC2626]" />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Role-Based Access Control (RBAC)</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Staf & Hak Akses Faskes</h1>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                  Pecah akun Faskes menjadi sub-akun staf (Pendaftaran, Rekam Medis, Apoteker/POS, Admin RS) dan tentukan checklist hak akses modul secara terpusat.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white text-xs font-bold transition-all shadow-lg shadow-teal-950/40 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Tambah Staf Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-800 border border-teal-100">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staf</p>
                  <h3 className="text-lg font-black text-slate-800">{staffs.length} Akun</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#16A34A] border border-emerald-100">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staf Aktif</p>
                  <h3 className="text-lg font-black text-slate-800">{staffs.filter(s => s.status === "active").length} Staf</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0284C7] border border-blue-100">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Terdaftar</p>
                  <h3 className="text-lg font-black text-slate-800">{roles.length} Role</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-800 border border-purple-100">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Fitur</p>
                  <h3 className="text-lg font-black text-slate-800">{permissions.raw?.length || 0} Modul</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("staffs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "staffs"
                    ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Daftar Staf Faskes</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{staffs.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "matrix"
                    ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Matrix Hak Akses (Checklist Fitur)</span>
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* TAB 1: DAFTAR STAF */}
          {activeTab === "staffs" && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              {/* Filter Pills by Unit / Departemen */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">Filter Unit / Departemen:</span>
                {DEPARTMENT_UNITS.map(unit => {
                  const isActive = selectedUnit.toLowerCase() === unit.id.toLowerCase();
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                        isActive
                          ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white border-teal-700 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {unit.icon && <span>{unit.icon}</span>}
                      <span>{unit.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama staf, email, jabatan, atau role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Menampilkan <strong>{filteredStaffs.length}</strong> dari {staffs.length} staf
                </p>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-800" />
                  <p>Memuat data staf Faskes...</p>
                </div>
              ) : filteredStaffs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-3">
                  <Users className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">Belum ada akun staf Faskes yang terdaftar</p>
                  <button
                    onClick={() => setIsAddStaffOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white text-xs font-bold cursor-pointer"
                  >
                    + Tambah Akun Staf Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                        <th className="p-3.5 rounded-l-xl">Nama Staf</th>
                        <th className="p-3.5">Jabatan / Posisi</th>
                        <th className="p-3.5">Role Akses</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right rounded-r-xl">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredStaffs.map((staff) => (
                        <tr key={staff.id} className="hover:bg-teal-50/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-teal-100 border border-teal-200 text-teal-900 flex items-center justify-center font-bold">
                                {staff.user?.name ? staff.user.name.charAt(0).toUpperCase() : "S"}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{staff.user?.name || "Staf"}</span>
                                <span className="text-[11px] text-slate-400">{staff.user?.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="text-slate-600">{staff.position || "Staff RS"}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 font-bold text-[11px]">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{staff.role?.name || "Role Karyawan"}</span>
                            </span>
                          </td>

                          <td className="p-3.5">
                            {staff.status === "active" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] text-[10px] font-bold border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                                <XCircle className="h-3 w-3" /> Nonaktif
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditStaffForm({
                                  id: staff.id,
                                  name: staff.user?.name || "",
                                  hospital_role_id: staff.hospital_role_id,
                                  position: staff.position || "",
                                  status: staff.status,
                                  password: ""
                                });
                                setIsEditStaffOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Edit Role / Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATRIX HAK AKSES (CHECKLIST PERMISSION) */}
          {activeTab === "matrix" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left Column: Role Selector */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pilih Role RS</h3>
                  <button
                    onClick={() => setIsAddRoleOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Custom Role</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(roles as any)?.map((roleItem) => {
                    const isSelected = selectedRole?.id === roleItem.id;
                    return (
                      <button
                        key={roleItem.id}
                        onClick={() => setSelectedRole(roleItem)}
                        className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white border-teal-700 shadow-md shadow-teal-900/20"
                            : "bg-slate-50/50 hover:bg-slate-100 text-slate-700 border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs">{roleItem.name}</span>
                          {roleItem.is_default && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              isSelected ? "bg-teal-800 text-teal-200" : "bg-slate-200 text-slate-600"
                            }`}>
                              Bawaan
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] line-clamp-2 ${isSelected ? "text-teal-200" : "text-slate-400"}`}>
                          {roleItem.description || "Peran staf RS"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Permission Matrix Checklist */}
              <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                {selectedRole ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-slate-900">{selectedRole.name}</h2>
                          {selectedRole.is_default && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[#D97706] text-[10px] font-bold border border-amber-200">
                              Template Default Sistem
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Centang modul dan fitur yang diperbolehkan untuk diakses oleh role ini.
                        </p>
                      </div>

                      <button
                        onClick={handleSaveMatrix}
                        disabled={savingMatrix}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white text-xs font-bold transition-all shadow-lg shadow-teal-900/20 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{savingMatrix ? "Menyimpan..." : "Simpan Hak Akses Role"}</span>
                      </button>
                    </div>

                    {/* Matrix Categories */}
                    <div className="space-y-6">
                      {Object.entries(permissions.grouped || {}).map(([categoryName, perms]) => {
                        const categoryPermIds = perms.map(p => p.id);
                        const allCategoryChecked = categoryPermIds.every(id => matrixChecklist.includes(id));

                        return (
                          <div key={categoryName} className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/30">
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-teal-800" />
                                <span>{categoryName}</span>
                              </h4>

                              <button
                                type="button"
                                onClick={() => toggleCategoryCheck(perms)}
                                className="text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
                              >
                                {allCategoryChecked ? "Uncheck Semua" : "Pilih Semua Kategori"}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {perms.map((perm) => {
                                const isChecked = matrixChecklist.includes(perm.id);

                                return (
                                  <div
                                    key={perm.id}
                                    onClick={() => togglePermissionCheck(perm.id)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                      isChecked
                                        ? "bg-teal-50/80 border-teal-200 text-slate-900"
                                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                                    }`}
                                  >
                                    <div className="mt-0.5">
                                      {isChecked ? (
                                        <CheckSquare className="h-5 w-5 text-teal-800" />
                                      ) : (
                                        <Square className="h-5 w-5 text-slate-300" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs">{perm.name}</span>
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-mono">
                                          {perm.code}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">{perm.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                    <Info className="h-8 w-8 mx-auto text-slate-300" />
                    <p>Pilih role di sebelah kiri untuk mengatur checklist hak akses.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: TAMBAH STAF BARU */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-800" />
                <span>Tambah Akun Staf Faskes</span>
              </h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Staf</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: drg. Anita Wijaya / Budi Santoso"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Staf</label>
                <input
                  type="email"
                  required
                  placeholder="staf.pendaftaran@rs.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Awal</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Unit / Departemen Medis (Preset Cepat)</label>
                <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                  {DEPARTMENT_UNITS.filter(u => u.id !== "ALL").map(unit => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => {
                        const matchingRole = (roles as any[])?.find((r: any) => 
                          r.name.toLowerCase() === unit.id.toLowerCase() || 
                          r.name.toLowerCase().includes(unit.id.toLowerCase())
                        );
                        setStaffForm({
                          ...staffForm,
                          position: `Staf Unit ${unit.label}`,
                          hospital_role_id: matchingRole ? matchingRole.id : staffForm.hospital_role_id
                        });
                      }}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200/90 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>{unit.icon}</span>
                      <span>{unit.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role & Hak Akses</label>
                <select
                  required
                  value={staffForm.hospital_role_id}
                  onChange={(e) => setStaffForm({ ...staffForm, hospital_role_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 font-medium"
                >
                  <option value="">-- Pilih Role Sub-Akun --</option>
                  {(roles as any)?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Petugas Pendaftaran Shift Pagi"
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STAF */}
      {isEditStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-teal-800" />
                <span>Edit Role & Staf</span>
              </h3>
              <button onClick={() => setIsEditStaffOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Staf</label>
                <input
                  type="text"
                  required
                  value={editStaffForm.name}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Hak Akses</label>
                <select
                  required
                  value={editStaffForm.hospital_role_id}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, hospital_role_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 font-medium"
                >
                  {(roles as any)?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  value={editStaffForm.position}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, position: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={editStaffForm.status}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 font-medium"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reset Password (Opsional)</label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  value={editStaffForm.password}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditStaffOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH ROLE CUSTOM */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-800" />
                <span>Buat Role Custom RS Baru</span>
              </h3>
              <button onClick={() => setIsAddRoleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Role Custom</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Petugas Laboratorium Khusus"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Tugas & Role</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan peran staf pemilik role ini..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold"
                >
                  Buat Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
