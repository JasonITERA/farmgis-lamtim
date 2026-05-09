import { useState } from 'react';
import OwnerForm from './OwnerForm'; 

export default function OwnerPanel() {
const [showForm, setShowForm] = useState(false);
const [owners, setOwners] = useState([]);
const [searchQuery, setSearchQuery] = useState("");

const handleSaveOwner = (newData) => {
    // Menambahkan ID unik dan menggabungkan data baru ke daftar pemilik
    setOwners([...owners, { id: Date.now(), ...newData }]);
    setShowForm(false); 
};

  // LOGIKA PENCARIAN: Menyaring data berdasarkan nama atau NIK
const filteredOwners = owners.filter((owner) =>
    owner.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.nik.includes(searchQuery)
);

return (
    <div className="panel-group">

        <div className="owner-panel-title">
            <h3>Pemilik Lahan</h3>
        </div>

        <div className="panel-content">

            <div className="owner-toolbar">
                <input 
                    type="text" 
                    placeholder="Cari nama atau NIK..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <button 
                    className="btn-add-small" 
                    onClick={() => setShowForm(true)}
                >
                    + Tambah Pemilik
                </button>
            </div>

            <div className="owner-panel-body">
                <table className="owner-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>NIK</th>
                            <th>Kelamin</th>
                            <th>Alamat Rumah</th>
                            <th>No HP</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner) => (
                                <tr key={owner.id}>
                                    <td>{owner.nama}</td>
                                    <td>{owner.nik}</td>
                                    <td>{owner.kelamin}</td>
                                    <td>{owner.alamat}</td>
                                    <td>{owner.hp}</td>

                                    <td>
                                        <div className="action-btns">

                                            <button 
                                                className="action-btn edit"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>

                                            <button 
                                                className="action-btn delete"
                                                title="Hapus"
                                            >
                                                🗑️
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    {owners.length === 0
                                        ? "Belum ada data pemilik. Silakan tambah data baru."
                                        : "Data pemilik tidak ditemukan."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>

        {showForm && (
            <OwnerForm 
                onClose={() => setShowForm(false)} 
                onSave={handleSaveOwner}
            />
        )}
    </div>
);
}