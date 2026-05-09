import { useState } from 'react';

export default function SidebarLeft({ 
onAddLahan, 
onAddFasilitas, 
lahanList = [], 
fasilitasList = [], 
onDelete, 
onEdit,
onDeleteFasilitas, 
onEditFasilitas 
}) {
const [search, setSearch] = useState('');
const [filter, setFilter] = useState('');
const [activeTab, setActiveTab] = useState('lahan');

const filteredLahan = lahanList.filter((item) => {
    const namaPemilik = item.Pemilik || '';
    const cocokPemilik = namaPemilik.toLowerCase().includes(search.toLowerCase());
    const cocokTanaman = !filter || item.Tanaman === filter;
    return cocokPemilik && cocokTanaman;
});

const filteredFasilitas = fasilitasList.filter((item) => {
    return (item.nama_fasilitas || '').toLowerCase().includes(search.toLowerCase());
});

return (
    <aside className="sidebar-left">
    <div className="sidebar-logo">
        <h1>FARMGIS</h1>
        <p>Sistem Informasi Lahan</p>
    </div>

    <div className="tab-container">
        <button 
        className={`tab-item ${activeTab === 'lahan' ? 'active' : ''}`}
        onClick={() => setActiveTab('lahan')}
        >
        🌱 Lahan
        </button>
        <button 
        className={`tab-item ${activeTab === 'fasilitas' ? 'active' : ''}`}
        onClick={() => setActiveTab('fasilitas')}
        >
        📍 Fasilitas
        </button>
    </div>

    <div className="sidebar-content">
        <div className="search-filter-wrapper">
        <input 
            type="text" 
            className="search-input"
            placeholder={activeTab === 'lahan' ? "Cari pemilik..." : "Cari fasilitas..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        {activeTab === 'lahan' && (
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Semua Tanaman</option>
            <option value="Padi">Padi</option>
            <option value="Jagung">Jagung</option>
            <option value="Singkong">Singkong</option>
            </select>
        )}
        </div>

        <div className="scrollable-list">
        {activeTab === 'lahan' ? (
            filteredLahan.length > 0 ? (
            filteredLahan.map((lahan) => (
                <div key={lahan.id} className="item-card">
                <div className="item-info">
                    <h3>{lahan.Pemilik || 'Tanpa Nama'}</h3>
                    <p><span>📍</span> {lahan.Lokasi}</p>
                    <p><span>📏</span> {lahan.Luas} m² • <b>{lahan.Tanaman}</b></p>
                </div>
                <div className="item-actions">
                    <button className="action-btn edit" onClick={() => onEdit(lahan)}>✏️</button>
                    <button className="action-btn delete" onClick={() => onDelete(lahan.id)}>🗑️</button>
                </div>
                </div>
            ))
            ) : <div className="empty-state">Data lahan tidak ditemukan.</div>
        ) : (
            filteredFasilitas.length > 0 ? (
            filteredFasilitas.map((f) => (
                <div key={f.id} className="item-card facility">
                <div className="item-info">
                    <h3>{f.nama_fasilitas}</h3>
                    <p><span>🛠️</span> {f.jenis_fasilitas}</p>
                    <p className="coord">{f.koordinat}</p>
                </div>
                <div className="item-actions">
                    <button className="action-btn edit" onClick={() => onEditFasilitas(f)}>✏️</button>
                    <button className="action-btn delete" onClick={() => onDeleteFasilitas(f.id)}>🗑️</button>
                </div>
                </div>
            ))
            ) : <div className="empty-state">Data fasilitas tidak ditemukan.</div>
        )}
        </div>
    </div>

    <div className="sidebar-footer">
        <button 
        className="btn-add-small full-width" 
        onClick={activeTab === 'lahan' ? onAddLahan : onAddFasilitas}
        >
        {activeTab === 'lahan' ? '+ Tambah Lahan Baru' : '+ Tambah Fasilitas'}
        </button>
    </div>
    </aside>
);
}