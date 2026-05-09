import { useState } from 'react'

export default function LahanForm({ onClose, onSave  }) {
const [formData, setFormData] = useState({
    Pemilik: '',
    Lokasi: '',
    Koordinat: '',
    Luas: '',
    Tanaman: '',
})

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    })
}

const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
}

return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation agar klik di dalam kotak putih tidak menutup modal */}
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>Tambah Data Lahan</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="full-width">
                        <label>Nama Pemilik</label>
                        <input
                            type="text"
                            name="Pemilik"
                            placeholder="Masukkan nama..."
                            value={formData.Pemilik}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label>Lokasi</label>
                        <input
                            type="text"
                            name="Lokasi"
                            placeholder="Kecamatan..."
                            value={formData.Lokasi}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label>Luas (Ha)</label>
                        <input
                            type="number"
                            name="Luas"
                            placeholder="0.0"
                            step="0.1"
                            value={formData.Luas}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="full-width">
                        <label>Titik Koordinat</label>
                        <input
                            type="text"
                            name="Koordinat"
                            placeholder="Lat, Long"
                            value={formData.Koordinat}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn-save">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    )
}