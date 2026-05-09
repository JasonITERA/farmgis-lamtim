// src/components/OwnerForm.jsx
import { useState } from 'react';

export default function OwnerForm({ onClose, onSave }) {
const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    kelamin: 'Laki-laki',
    alamat: '',
    hp: ''
});

const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Kirim data ke OwnerPanel
};

return (
    <div className="modal-overlay">
    <div className="modal-box">
        <div className="modal-header">
        <h3>Tambah Pemilik Lahan</h3>
        <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Nama Lengkap</label>
            <input 
            type="text" 
            required 
            placeholder="Masukkan nama sesuai KTP"
            onChange={e => setFormData({...formData, nama: e.target.value})} 
            />
        </div>

        <div className="form-group">
            <label>NIK (16 Digit)</label>
            <input 
            type="text" 
            required 
            maxLength="16"
            placeholder="1801xxxxxxxxxxxx"
            onChange={e => setFormData({...formData, nik: e.target.value})} 
            />
        </div>

        <div className="form-group">
            <label>Jenis Kelamin</label>
            <select onChange={e => setFormData({...formData, kelamin: e.target.value})}>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
            </select>
        </div>

        <div className="form-group">
            <label>Alamat Lengkap</label>
            <textarea 
            required 
            placeholder="Jl. Mawar No. 10..."
            onChange={e => setFormData({...formData, alamat: e.target.value})}
            ></textarea>
        </div>

        <div className="form-group">
            <label>Nomor HP</label>
            <input 
            type="tel" 
            required 
            placeholder="0823xxxxxxxx"
            onChange={e => setFormData({...formData, hp: e.target.value})} 
            />
        </div>

        <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-save">Simpan Data</button>
        </div>
        </form>
    </div>
    </div>
);
}