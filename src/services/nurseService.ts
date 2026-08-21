import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

export async function getNurses(params?: Record<string, any>) {
  try {
    const res = await apiGet('/api/nurse', params);
    return res;
  } catch (err: any) {
    console.error('Error fetching nurses:', err);
    return { success: false, data: [], message: err.message || 'Gagal memuat data perawat' };
  }
}

export async function getNurseById(id: string | number) {
  try {
    const res = await apiGet(`/api/nurse/${id}`);
    return res;
  } catch (err: any) {
    console.error('Error fetching nurse by ID:', err);
    return { success: false, data: null, message: err.message || 'Gagal memuat detail perawat' };
  }
}

export async function createNurse(data: any) {
  try {
    const res = await apiPost('/api/nurse', data);
    return res;
  } catch (err: any) {
    console.error('Error creating nurse:', err);
    return { success: false, message: err.message || 'Gagal menambahkan perawat' };
  }
}

export async function updateNurse(id: string | number, data: any) {
  try {
    const res = await apiPut(`/api/nurse/${id}`, data);
    return res;
  } catch (err: any) {
    console.error('Error updating nurse:', err);
    return { success: false, message: err.message || 'Gagal memperbarui data perawat' };
  }
}

export async function deleteNurse(id: string | number) {
  try {
    const res = await apiDelete(`/api/nurse/${id}`);
    return res;
  } catch (err: any) {
    console.error('Error deleting nurse:', err);
    return { success: false, message: err.message || 'Gagal menghapus data perawat' };
  }
}
