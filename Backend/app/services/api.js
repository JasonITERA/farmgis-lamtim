import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiService = {
    // ==========================================
    // MODUL LAHAN ENDPOINTS
    // ==========================================
    get_lahan_for_map: async () => {
        // Menembak endpoint khusus GeoJSON peta (/api/lahan/peta)
        const response = await axios.get(`${API_BASE_URL}/lahan/peta`);
        return response.data;
    },
    create_lahan: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/lahan`, payload);
        return response.data;
    },
    delete_lahan: async (id_lahan) => {
        const response = await axios.delete(`${API_BASE_URL}/lahan/${id_lahan}`);
        return response.data;
    },

    // ==========================================
    // MODUL PEMILIK ENDPOINTS
    // ==========================================
    get_all_pemilik: async () => {
        const response = await axios.get(`${API_BASE_URL}/pemilik`);
        return response.data;
    },
    create_pemilik: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/pemilik`, payload);
        return response.data;
    },
    update_pemilik: async (id, payload) => {
        const response = await axios.put(`${API_BASE_URL}/pemilik/${id}`, payload);
        return response.data;
    },
    delete_pemilik: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/pemilik/${id}`);
        return response.data;
    },

    // ==========================================
    // MODUL TANAMAN ENDPOINTS
    // ==========================================
    get_all_tanaman: async () => {
        const response = await axios.get(`${API_BASE_URL}/tanaman`);
        return response.data;
    },
    create_tanaman: async (payload) => {
        const response = await axios.post(`${API_BASE_URL}/tanaman`, payload);
        return response.data;
    },
    update_tanaman: async (id, payload) => {
        const response = await axios.put(`${API_BASE_URL}/tanaman/${id}`, payload);
        return response.data;
    },
    delete_tanaman: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/tanaman/${id}`);
        return response.data;
    }
};