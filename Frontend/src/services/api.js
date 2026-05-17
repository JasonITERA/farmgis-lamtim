// src/services/api.js

const BASE_URL = "http://127.0.0.1:8000/api";

export const apiService = {
  // ==========================================
  // CRUD PEMILIK
  // ==========================================
  get_all_pemilik: async () => {
    const res = await fetch(`${BASE_URL}/pemilik`);
    if (!res.ok) throw new Error("Gagal mengambil data pemilik");
    return res.json();
  },
  create_pemilik: async (data) => {
    const res = await fetch(`${BASE_URL}/pemilik`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  update_pemilik: async (id, data) => {
    const res = await fetch(`${BASE_URL}/pemilik/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  delete_pemilik: async (id) => {
    const res = await fetch(`${BASE_URL}/pemilik/${id}`, { method: "DELETE" });
    return res.json();
  },

  // ==========================================
  // CRUD TANAMAN
  // ==========================================
  get_all_tanaman: async () => {
    const res = await fetch(`${BASE_URL}/tanaman`);
    if (!res.ok) throw new Error("Gagal mengambil data tanaman");
    return res.json();
  },
  create_tanaman: async (data) => {
    const res = await fetch(`${BASE_URL}/tanaman`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  update_tanaman: async (id, data) => {
    const res = await fetch(`${BASE_URL}/tanaman/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  delete_tanaman: async (id) => {
    const res = await fetch(`${BASE_URL}/tanaman/${id}`, { method: "DELETE" });
    return res.json();
  },

  // ==========================================
  // SPASIAL GIS: LAHAN & FASILITAS
  // ==========================================
get_peta_lahan: async () => {
    const res = await fetch(`${BASE_URL}/lahan/peta`);
    return res.json();
},
create_lahan: async (data) => {
    const res = await fetch(`${BASE_URL}/lahan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });
    return res.json();
},
get_peta_fasilitas: async () => {
    const res = await fetch(`${BASE_URL}/fasilitas/peta`);
    return res.json();
},
create_fasilitas: async (data) => {
    const res = await fetch(`${BASE_URL}/fasilitas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });
    return res.json();
},

  // STATISTIK DASHBOARD
get_stats: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    return res.json();
}
};