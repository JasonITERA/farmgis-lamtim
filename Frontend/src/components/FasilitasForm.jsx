import { useState } from 'react';

export default function FasilitasForm({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        namaFasilitas: '',
        jenis: '',
        status: 'Baik',
        koordinat: '',
        keterangan: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>Tambah Data Fasilitas</h2>
                <form onSubmit={handleSubmit}>
                    {/* Input Nama - Baris Penuh */}
                    <div className="full-width">
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#2e7d32'}}>Nama Fasilitas</label>
                        <input 
                            type="text" 
                            placeholder="Contoh: Gudang Pupuk / Irigasi" 
                            value={formData.namaFasilitas}
                            onChange={(e) => setFormData({...formData, namaFasilitas: e.target.value})}
                            required 
                        />
                    </div>

                    {/* Baris 2 - Dibagi dua kolom */}
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#2e7d32'}}>Jenis</label>
                        <select 
                            value={formData.jenis}
                            onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                            required
                        >
                            <option value="">Pilih Jenis</option>
                            <option value="Bangunan">Bangunan</option>
                            <option value="Irigasi">Irigasi</option>
                            <option value="Peralatan">Peralatan</option>
                        </select>
                    </div>

                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#2e7d32'}}>Status Kondisi</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                        </select>
                    </div>

                    {/* Input Koordinat - Baris Penuh */}
                    <div className="full-width">
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#2e7d32'}}>Titik Koordinat</label>
                        <input 
                            type="text" 
                            placeholder="Lat, Lng (Contoh: -5.123, 105.456)" 
                            value={formData.koordinat}
                            onChange={(e) => setFormData({...formData, koordinat: e.target.value})}
                            required 
                        />
                    </div>

                    {/* Keterangan - Baris Penuh */}
                    <div className="full-width">
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#2e7d32'}}>Keterangan</label>
                        <textarea 
                            className="full-width"
                            placeholder="Tambahkan info tambahan..." 
                            rows="3"
                            value={formData.keterangan}
                            onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                        />
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn-save">Simpan Fasilitas</button>
                    </div>
                </form>
            </div>
        </div>
    );
}