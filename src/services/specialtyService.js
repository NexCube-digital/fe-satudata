// Service helper to manage Doctor Specialties (Spesialisasi / Poliklinik Dokter)

const STORAGE_KEY = "faskes_doctor_specialties_v1";

const DEFAULT_SPECIALTIES = [
  { id: "sp-1", code: "POLI-PD", name: "Spesialis Penyakit Dalam", category: "Rawat Jalan / Inap", status: "active" },
  { id: "sp-2", code: "POLI-PARU", name: "Spesialis Paru - Pulmonologi", category: "Rawat Jalan / Inap", status: "active" },
  { id: "sp-3", code: "POLI-BDH", name: "Spesialis Bedah", category: "Bedah / Inap", status: "active" },
  { id: "sp-4", code: "POLI-BTKV", name: "Spesialis Bedah Thoraks Dan Kardiovaskuler", category: "Bedah / Inap", status: "active" },
  { id: "sp-5", code: "POLI-JTG", name: "Spesialis Jantung dan Pembuluh Darah", category: "Kardiologi", status: "active" },
  { id: "sp-6", code: "POLI-OBG", name: "Spesialis Obstetri & Ginekologi", category: "Kandungan", status: "active" },
  { id: "sp-7", code: "POLI-ANK", name: "Dokter Spesialis Anak", category: "Pediatri", status: "active" },
  { id: "sp-8", code: "POLI-KFR", name: "Spesialis Kedokteran Fisik Dan Rehabilitasi", category: "Rehab Medis", status: "active" },
  { id: "sp-9", code: "POLI-UMM", name: "Dokter Umum", category: "Pelayanan Umum / IGD", status: "active" },
  { id: "sp-10", code: "POLI-SRF", name: "Spesialis Saraf / Neurologi", category: "Neurologi", status: "active" },
  { id: "sp-11", code: "POLI-ANS", name: "Spesialis Anestesiologi", category: "Anestesi", status: "active" },
  { id: "sp-12", code: "POLI-MTA", name: "Spesialis Mata", category: "Oftalmologi", status: "active" },
  { id: "sp-13", code: "POLI-THT", name: "Spesialis THT-KL", category: "THT", status: "active" },
  { id: "sp-14", code: "POLI-KLT", name: "Spesialis Kulit & Kelamin", category: "Dermatologi", status: "active" },
  { id: "sp-15", code: "POLI-JWA", name: "Spesialis Kedokteran Jiwa (Psikiatri)", category: "Psikiatri", status: "active" },
  { id: "sp-16", code: "POLI-URL", name: "Spesialis Urologi", category: "Bedah Urologi", status: "active" },
  { id: "sp-17", code: "POLI-ORT", name: "Spesialis Orthopedi & Traumatologi", category: "Orthopedi", status: "active" },
];

export function getSpecialties() {
  if (typeof window === "undefined") return DEFAULT_SPECIALTIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let list = DEFAULT_SPECIALTIES;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Clean up any old "Kepala Klinik / Dokter Umum" entries & deduplicate
    const seenNames = new Set();
    const cleaned = [];
    for (const item of list) {
      const name = item.name === "Kepala Klinik / Dokter Umum" ? "Dokter Umum" : item.name;
      if (!seenNames.has(name)) {
        seenNames.add(name);
        cleaned.push({ ...item, name });
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch (err) {
    console.error("Gagal membaca spesialisasi dari localStorage", err);
    return DEFAULT_SPECIALTIES;
  }
}

export function saveSpecialties(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Gagal menyimpan spesialisasi ke localStorage", err);
  }
}

export function createSpecialty(item) {
  const current = getSpecialties();
  const newId = `sp-${Date.now()}`;
  const newItem = {
    id: newId,
    code: (item.code || `SP-${current.length + 1}`).trim().toUpperCase(),
    name: (item.name || "").trim(),
    category: (item.category || "Poliklinik").trim(),
    status: item.status || "active",
  };

  const updated = [newItem, ...current];
  saveSpecialties(updated);
  return newItem;
}

export function updateSpecialty(id, payload) {
  const current = getSpecialties();
  const updated = current.map((item) => {
    if (String(item.id) === String(id)) {
      return {
        ...item,
        code: payload.code ? payload.code.trim().toUpperCase() : item.code,
        name: payload.name ? payload.name.trim() : item.name,
        category: payload.category !== undefined ? payload.category.trim() : item.category,
        status: payload.status !== undefined ? payload.status : item.status,
      };
    }
    return item;
  });

  saveSpecialties(updated);
  return updated.find((i) => String(i.id) === String(id));
}

export function deleteSpecialty(id) {
  const current = getSpecialties();
  const updated = current.filter((item) => String(item.id) !== String(id));
  saveSpecialties(updated);
  return true;
}
