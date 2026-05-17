// src/components/OwnerForm.jsx
import { useState } from 'react';

export default function OwnerForm({ onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        nama_pemilik: initialData?.nama_pemilik || '',
        nik: initialData?.nik || '',
        jenis_kelamin: initialData?.jenis_kelamin || 'Laki-laki',
        alamat: initialData?.alamat || '',
        no_hp: initialData?.no_hp || ''
    });

    // KITA UBAH MENJADI FUNGSI BIASA (TANPA e.preventDefault)
    const handleDirectSubmit = () => {
        console.log("=== [FORM CHECK] PROSES LIVE SUBMIT DIMULAI ===");
        console.log("Data yang terkumpul di form saat ini:", formData);

        // Validasi manual sederhana agar kita tahu kolom mana yang kosong
        if (!formData.nama_pemilik || !formData.nik || !formData.alamat || !formData.no_hp) {
            alert("⚠️ Gagal Menyimpan: Semua kolom wajib diisi!");
            console.warn("Ada kolom yang masih kosong, pengiriman dibatalkan oleh frontend.");
            return;
        }

        if (onSave) {
            if (initialData?.id_pemilik) {
                console.log("Mengirim data UPDATE ke App.jsx...");
                onSave({ id_pemilik: initialData.id_pemilik, ...formData });
            } else {
                console.log("Mengirim data CREATE ke App.jsx...");
                onSave(formData);
            }
            // Jangan langsung onClose di sini jika ingin memastikan log di App.jsx berjalan dulu,
            // tapi karena di App.jsx kita sudah pakai refreshAllData, onClose di sini aman.
            onClose(); 
        } else {
            console.error("❌ Fungsi onSave tidak ditemukan di properti komponen OwnerForm!");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>{initialData ? '⚡ Edit Pemilik Lahan' : '➕ Tambah Pemilik Lahan'}</h3>
                </div>
                
                {/* Kita buang atribut onSubmit dari tag form agar tidak memicu validasi bawaan browser */}
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input 
                            type="text" 
                            value={formData.nama_pemilik}
                            placeholder="Masukkan nama sesuai KTP"
                            onChange={e => setFormData({...formData, nama_pemilik: e.target.value})} 
                        />
                    </div>

                    <div className="form-group">
                        <label>NIK (16 Digit)</label>
                        <input 
                            type="text" 
                            maxLength="16"
                            value={formData.nik}
                            placeholder="1801xxxxxxxxxxxx"
                            onChange={e => setFormData({...formData, nik: e.target.value})} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Jenis Kelamin</label>
                        <select 
                            value={formData.jenis_kelamin}
                            onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})}
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Alamat Lengkap</label>
                        <textarea 
                            value={formData.alamat}
                            placeholder="Jl. Mawar No. 10..."
                            onChange={e => setFormData({...formData, alamat: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Nomor HP</label>
                        <input 
                            type="tel" 
                            value={formData.no_hp}
                            placeholder="0823xxxxxxxx"
                            onChange={e => setFormData({...formData, no_hp: e.target.value})} 
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Batal
                        </button>
                        {/* UBAH TYPE MENJADI BUTTON DAN PASANG ONCLICK MANUAl */}
                        <button type="button" className="btn-save" onClick={handleDirectSubmit}>
                            {initialData ? 'Update Data' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}