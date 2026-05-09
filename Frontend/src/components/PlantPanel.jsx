import { useState } from 'react';

export default function PlantPanel() {
const [plants, setPlants] = useState([
    { id: 1, nama: 'Padi', masaTanam: '4 Bulan', warna: '#2e7d32' },
    { id: 2, nama: 'Jagung', masaTanam: '3 Bulan', warna: '#fbc02d' }
]);

const [showPopup, setShowPopup] = useState(false);
const [formData, setFormData] = useState({
    nama: "",
    masaTanam: ""
});

  // Fungsi untuk Menghapus Tanaman
const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data tanaman ini?")) {
    const updatedPlants = plants.filter(plant => plant.id !== id);
    setPlants(updatedPlants);
    }
};

const handleSave = (e) => {
    e.preventDefault();
    if (formData.nama && formData.masaTanam) {
    const newEntry = {
        id: Date.now(),
        ...formData,
        warna: '#4caf50' 
    };
    setPlants([...plants, newEntry]);
    setFormData({ nama: "", masaTanam: "" });
    setShowPopup(false); 
    }
};

return (
    <div className="panel-group">

        <div className="plant-panel-title">
            <h3>Data Tanaman & Masa Tanam</h3>
        </div>

        <div className="panel-content">

            <div className="plant-panel-body">

                <table className="owner-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Jenis Tanaman</th>
                            <th>Masa Tanam</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {plants.length > 0 ? (
                            plants.map((plant, index) => (
                                <tr key={plant.id}>

                                    <td>{index + 1}</td>

                                    <td className="plant-name-cell">
                                        <span
                                            className="color-dot"
                                            style={{
                                                backgroundColor: plant.warna
                                            }}
                                        ></span>

                                        {plant.nama}
                                    </td>

                                    <td>{plant.masaTanam}</td>

                                    <td>
                                        <div className="action-btns">

                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(plant.id)}
                                                title="Hapus Tanaman"
                                            >
                                                🗑️
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="empty-state">
                                    Data tanaman kosong
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <button
                    className="btn-add-small"
                    onClick={() => setShowPopup(true)}
                    style={{ marginTop: '20px' }}
                >
                    + Tambah Data Tanaman
                </button>

            </div>

        </div>

        {/* MODAL */}
        {showPopup && (
            <div className="modal-overlay">

                <div className="modal-box">

                    <h2>Tambah Data Tanaman</h2>

                    <form onSubmit={handleSave}>

                        <div className="form-group">
                            <label>Jenis Tanaman</label>

                            <input
                                type="text"
                                placeholder="Contoh: Kedelai..."
                                value={formData.nama}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nama: e.target.value
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Masa Tanam</label>

                            <input
                                type="text"
                                placeholder="Contoh: 3 Bulan..."
                                value={formData.masaTanam}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        masaTanam: e.target.value
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowPopup(false)}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="btn-save"
                            >
                                Simpan
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        )}

    </div>
);
};