// src/components/OwnerPanel.jsx
import { useState } from 'react';
import OwnerForm from './OwnerForm'; 

export default function OwnerPanel({ owners = [], onSave, onDelete }) { 
    const [editingOwner, setEditingOwner] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOwners = owners.filter((owner) =>
        (owner.nama_pemilik?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (owner.nik || "").includes(searchQuery)
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
                        onClick={() => {
                            setEditingOwner(null); 
                            setShowForm(true);
                        }}
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
                                    <tr key={owner.id_pemilik}>
                                        <td>{owner.nama_pemilik}</td>
                                        <td>{owner.nik}</td>
                                        <td>{owner.jenis_kelamin}</td>
                                        <td>{owner.alamat}</td>
                                        <td>{owner.no_hp}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button 
                                                    className="action-btn edit"
                                                    onClick={() => setEditingOwner(owner)}
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="action-btn delete"
                                                    onClick={() => {
                                                        if(window.confirm(`Hapus "${owner.nama_pemilik}"?`)) {
                                                            onDelete(owner.id_pemilik); 
                                                        }
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                                        {owners.length === 0 ? "Belum ada data" : "Tidak ditemukan"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(showForm || editingOwner) && (
                <OwnerForm 
                    initialData={editingOwner} 
                    onClose={() => {
                        setShowForm(false);
                        setEditingOwner(null);
                    }} 
                    onSave={(data) => {
                        onSave(data);
                        setShowForm(false);
                        setEditingOwner(null);
                    }}
                />
            )}
        </div>
    );
}