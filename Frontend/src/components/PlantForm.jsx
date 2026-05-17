// src/components/PlantForm.jsx
import { useState } from 'react';

export default function PlantForm({ onClose, onSave, initialData }) {
    // Properti disinkronkan langsung dari initialData sejak awal render
    const [formData, setFormData] = useState({
        id_tanaman: initialData?.id_tanaman || initialData?.id || null,
        jenis_tanaman: initialData?.jenis_tanaman || '',
        masa_tanam: initialData?.masa_tanam || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (onSave) {
            console.log("PlantForm mengirim payload ke App.jsx:", formData);
            onSave(formData);
        } else {
            try {
                const isEdit = formData.id_tanaman;
                const url = isEdit 
                    ? `http://127.0.0.1:8000/api/tanaman/${formData.id_tanaman}`
                    : 'http://127.0.0.1:8000/api/tanaman';
                
                const response = await fetch(url, {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                if (response.ok) {
                    alert(isEdit ? "Data Varietas Tanaman Berhasil Diperbarui!" : "Data Varietas Tanaman Berhasil Disimpan ke PostgreSQL!");
                    onClose();
                } else {
                    alert(`Gagal: ${result.detail}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Gagal terhubung ke server backend FastAPI.");
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>{initialData ? 'Edit Data Tanaman' : 'Tambah Data Tanaman'}</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Jenis Tanaman</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Contoh: Padi, Jagung, Singkong"
                            value={formData.jenis_tanaman}
                            onChange={e => setFormData({...formData, jenis_tanaman: e.target.value})} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Masa Tanam</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Contoh: 3-4 Bulan"
                            value={formData.masa_tanam}
                            onChange={e => setFormData({...formData, masa_tanam: e.target.value})} 
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn-save">
                            {initialData ? 'Update Data' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}