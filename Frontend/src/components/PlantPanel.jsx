// src/components/PlantPanel.jsx
import { useState } from 'react';
import PlantForm from './PlantForm';

export default function PlantPanel({ plants = [], onSave, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [editingPlant, setEditingPlant] = useState(null);

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
                            {plants && plants.length > 0 ? (
                                plants.map((plant, index) => {
                                    // Ambil ID unik murni dari FastAPI/PostgreSQL
                                    const plantId = plant.id_tanaman || plant.id;
                                    
                                    // Membaca key asli dari database agar sinkron
                                    const namaTanaman = plant.jenis_tanaman || plant.nama_tanaman || plant.nama || "Tanaman Tanpa Nama";
                                    const masaTanam = plant.masa_tanam || plant.periode_tanam || plant.masaTanam || "Tidak ada data";

                                    return (
                                        <tr key={plantId || index}>
                                            <td>{index + 1}</td>
                                            <td className="plant-name-cell">
                                                <span
                                                    className="color-dot"
                                                    style={{ backgroundColor: plant.warna || '#4caf50' }}
                                                ></span>
                                                {namaTanaman}
                                            </td>
                                            <td>{masaTanam}</td>
                                            <td>
                                                <div className="action-btns">
                                                    <button 
                                                        className="action-btn edit"
                                                        onClick={() => {
                                                            // PERBAIKAN UTAMA: Mengunci data objek AND mengaktifkan showForm bersamaan
                                                            setEditingPlant({
                                                                id_tanaman: plantId,
                                                                jenis_tanaman: namaTanaman,
                                                                masa_tanam: masaTanam
                                                            });
                                                            setShowForm(true); 
                                                        }}
                                                    >✏️</button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => {
                                                            if (window.confirm(`Hapus data tanaman ${namaTanaman}?`)) {
                                                                onDelete(plantId);
                                                            }
                                                        }}
                                                    >🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                                        Belum ada data tanaman
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <button
                        className="btn-add-small"
                        onClick={() => {
                            setEditingPlant(null);
                            setShowForm(true);
                        }}
                        style={{ marginTop: '20px' }}
                    >
                        + Tambah Data Tanaman
                    </button>
                </div>
            </div>

            {/* PERBAIKAN KONDISI: Merujuk penuh pada state showForm agar siklus hidup komponen Form stabil */}
            {showForm && (
                <PlantForm 
                    initialData={editingPlant}
                    onClose={() => {
                        setShowForm(false);
                        setEditingPlant(null);
                    }} 
                    onSave={onSave}
                />
            )}
        </div>
    );
}