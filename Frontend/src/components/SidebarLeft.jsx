// src/components/SidebarLeft.jsx
import { useState } from 'react';

export default function SidebarLeft({
    onAddLahan,
    onAddFasilitas,

    lahanList = [],
    fasilitasList = [],

    onDelete,
    onEdit,            // WAJIB: Digunakan mutlak untuk edit Lahan
    onSelectLahan,     // WAJIB DITANGKAP: Untuk menggeser fokus peta saat kartu diklik (Lahan & Fasilitas)

    onDeleteFasilitas,
    onEditFasilitas,   // WAJIB: Digunakan mutlak untuk edit Fasilitas
}) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('lahan');

    /* ==========================================================
       FILTER DATA LAHAN (Mendukung nama pemilik dari Frontend / Backend)
    ========================================================== */
    const filteredLahan = lahanList.filter((item) => {
        const namaPemilik = item.Pemilik || item.nama_pemilik || (item.id_pemilik ? `Pemilik ID: ${item.id_pemilik}` : '');
        return namaPemilik
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    /* ==========================================================
       FILTER DATA FASILITAS
    ========================================================== */
    const filteredFasilitas = fasilitasList.filter((item) => {
        const nama = item.nama_fasilitas || ''; 
        return nama
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (
        <aside className="sidebar-left">
            {/* HEADER */}
            <div className="sidebar-logo">
                <h1>FARMGIS</h1>
                <p>Sistem Informasi Lahan</p>
            </div>

            {/* TAB */}
            <div className="tab-container">
                <button
                    className={`tab-item ${activeTab === 'lahan' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('lahan');
                        setSearch('');
                    }}
                >
                    🌱 Lahan
                </button>

                <button
                    className={`tab-item ${activeTab === 'fasilitas' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('fasilitas');
                        setSearch('');
                    }}
                >
                    📍 Fasilitas
                </button>
            </div>

            {/* CONTENT */}
            <div className="sidebar-content">
                {/* SEARCH */}
                <div className="search-filter-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder={
                            activeTab === 'lahan'
                                ? 'Cari pemilik...'
                                : 'Cari fasilitas...'
                        }
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* LIST */}
                <div className="scrollable-list">
                    {/* ==================== LAHAN ==================== */}
                    {activeTab === 'lahan' ? (
                        filteredLahan.length > 0 ? (
                            filteredLahan.map((lahan, index) => {
                                const displayPemilik = lahan.nama_pemilik || lahan.Pemilik || (lahan.id_pemilik ? `Pemilik ID: ${lahan.id_pemilik}` : 'Tanpa Nama');
                                const displayLokasi = lahan.lokasi || lahan.Lokasi || '-';
                                
                                let displayLuas = '0';
                                if (lahan.Luas !== undefined && lahan.Luas !== '') {
                                    displayLuas = lahan.Luas;
                                } else if (lahan.luas_m2) {
                                    const calculated = lahan.luas_m2 / 10000;
                                    displayLuas = calculated < 0.001 ? calculated.toFixed(4) : calculated.toFixed(2);
                                }
                                        
                                const displayTanaman = lahan.jenis_tanaman || lahan.Tanaman || (lahan.id_tanaman ? `Tanaman ID: ${lahan.id_tanaman}` : '');
                                
                                let displayKoordinat = lahan.Koordinat || '';
                                if (!displayKoordinat && lahan.geojson_polygon?.coordinates?.[0]?.[0]) {
                                    const firstPoint = lahan.geojson_polygon.coordinates[0][0];
                                    displayKoordinat = `${firstPoint[1].toFixed(6)}, ${firstPoint[0].toFixed(6)} (Polygon)`;
                                }

                                return (
                                    <div 
                                        key={lahan.id_lahan || lahan.id || index} 
                                        className="item-card" 
                                        onClick={() => onSelectLahan && onSelectLahan(lahan)} // INTERAKSI: Geser fokus peta
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="item-info">
                                            <h3>{displayPemilik}</h3>
                                            <p><span>📍</span> {displayLokasi}</p>
                                            <p><span>📏</span> {displayLuas} Ha {displayTanaman ? ` • ${displayTanaman}` : ''}</p>
                                            {displayKoordinat && <p className="coord">{displayKoordinat}</p>}
                                        </div>

                                        <div className="item-actions" onClick={(e) => e.stopPropagation()}> 
                                            <button 
                                                className="action-btn edit" 
                                                onClick={() => {
                                                    if (onEdit) onEdit(lahan);
                                                }}
                                                title="Edit"
                                            >✏️</button>
                                            <button 
                                                className="action-btn delete" 
                                                onClick={() => onDelete && onDelete(lahan.id_lahan || lahan.id || index)}
                                                title="Hapus"
                                            >🗑️</button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">Data lahan tidak ditemukan.</div>
                        )
                    ) : (
                        /* ==================== FASILITAS ==================== */
                        filteredFasilitas.length > 0 ? (
                            filteredFasilitas.map((f, index) => (
                                <div 
                                    key={f.id_fasilitas || f.id || index} 
                                    className="item-card facility"
                                    onClick={() => onSelectLahan && onSelectLahan(f)} // INTERAKSI: Klik kartu fasilitas untuk geser fokus ke titik koordinatnya
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="item-info">
                                        <h3>{f.nama_fasilitas}</h3>
                                        <p>Jenis: {f.jenis_fasilitas}</p>
                                        
                                        {/* PERBAIKAN KOORDINAT FASILITAS */}
                                        {f.koordinat && (
                                            <p className="coord">📍 LatLng: {f.koordinat}</p>
                                        )}
                                    </div>

                                    <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="action-btn edit"
                                            onClick={() => {
                                                if (onEditFasilitas) onEditFasilitas(f);
                                            }}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="action-btn delete"
                                            title="Hapus"
                                            onClick={() => {
                                                if (window.confirm(`Hapus fasilitas "${f.nama_fasilitas}"?`)) {
                                                    if (onDeleteFasilitas) {
                                                        onDeleteFasilitas(f.id_fasilitas || f.id || index);
                                                    }
                                                }
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Data fasilitas tidak ditemukan.</div>
                        )
                    )}
                </div>
            </div>

            {/* FOOTER */}
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