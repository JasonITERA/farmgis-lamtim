// src/components/LahanForm.jsx
import { useState } from 'react';
import MapPickerModal from './MapPickerModal'; // Pastikan path file ini sudah benar

export default function LahanForm({ isEditMode, editData, owners = [], plants = [], onClose, onSave }) {

    // 1. Helper pengekstraksi data awal (Mengubah data backend ke format internal Leaflet [Lat, Lng])
    const extractInitialValues = (data, isEdit) => {
        let parsedPolygon = [];
        let parsedPoint = null;
        let displayGeom = '';
        let displayLuas = '';

        if (isEdit && data) {
            // KUNCI PERBAIKAN 1: Baca data targetGeom sesuai nama yang dikirim oleh App.jsx
            const targetGeom = data.geojson_polygon || data.geom;

            // Ekstraksi Poligon Batas Wilayah GeoJSON dari Backend ([Lng, Lat] -> [Lat, Lng])
            if (targetGeom?.type === "Polygon" && targetGeom.coordinates) {
                const rawRing = targetGeom.coordinates[0] || [];
                // Hilangkan node terakhir jika duplikat (GeoJSON menutup poligon, Leaflet tidak perlu)
                const safeRing = rawRing.length > 3 && 
                    rawRing[0][0] === rawRing[rawRing.length - 1][0] && 
                    rawRing[0][1] === rawRing[rawRing.length - 1][1]
                    ? rawRing.slice(0, -1)
                    : rawRing;

                parsedPolygon = safeRing.map(c => [Number(c[1]), Number(c[0])]); // [Lat, Lng]
            }

            // Ekstraksi Point Lokasi Pusat Lahan
            if (data.koordinat) {
                // Jika dari DB berbentuk string "lat,lng"
                const parts = data.koordinat.split(',').map(Number);
                if (parts.length === 2 && !isNaN(parts[0])) {
                    parsedPoint = [parts[0], parts[1]]; // [Lat, Lng]
                    displayGeom = `${parts[0].toFixed(6)}, ${parts[1].toFixed(6)}`;
                }
            } else if (data.koordinat_klik && Array.isArray(data.koordinat_klik)) {
                // Jika dari GeoJSON Point [Lng, Lat]
                parsedPoint = [data.koordinat_klik[1], data.koordinat_klik[0]];
                displayGeom = `${data.koordinat_klik[1].toFixed(6)}, ${data.koordinat_klik[0].toFixed(6)}`;
            }

            displayLuas = data.luas_m2 || '';
        }

        return {
            id_pemilik: isEdit && data ? (data.id_pemilik || data.idPemilik || '') : '',
            id_tanaman: isEdit && data ? (data.id_tanaman || data.idTanaman || '') : '',
            lokasi: isEdit && data ? (data.lokasi || '') : '',
            luas_m2: displayLuas,
            polygonCoords: parsedPolygon,
            pointCoord: parsedPoint,
            geom_display: displayGeom
        };
    };

    // 2. Inisialisasi State Utama Form
    const [formData, setFormData] = useState(() => extractInitialValues(editData, isEditMode));
    
    // State kontrol modal peta dan mode aktifnya ('point' atau 'polygon')
    const [mapConfig, setMapConfig] = useState({ isOpen: false, mode: null });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const openMap = (mode) => {
        setMapConfig({ isOpen: true, mode: mode });
    };

    // 3. Callback penangkap data dari MapPickerModal setelah user klik Konfirmasi di peta
    const handleMapConfirm = (updatedPolygon, updatedPoint) => {
        setFormData((prev) => {
            const nextState = { ...prev };

            if (mapConfig.mode === 'point' && updatedPoint) {
                // Menyimpan data Titik Koordinat Pusat Lahan
                nextState.pointCoord = updatedPoint;
                nextState.geom_display = `${updatedPoint[0].toFixed(6)}, ${updatedPoint[1].toFixed(6)}`;
            } 
            
            else if (mapConfig.mode === 'polygon' && updatedPolygon.length > 0) {
                // Menyimpan data Poligon Wilayah Lahan
                nextState.polygonCoords = updatedPolygon;
                
                if (updatedPolygon.length >= 3) {
                    // =========================================================================
                    // KALKULASI LUAS MANDIRI (Rumus Shoelace Spherical - Hasil dalam Meter Persegi)
                    // =========================================================================
                    const RADIUS_BUMI = 6378137; // Jari-jari bumi dalam satuan meter
                    let totalArea = 0;
                    
                    for (let i = 0; i < updatedPolygon.length; i++) {
                        const p1 = updatedPolygon[i];
                        const p2 = updatedPolygon[(i + 1) % updatedPolygon.length];
                        
                        // Konversi derajat koordinat [Lat, Lng] ke Radian
                        const lat1Rad = (p1[0] * Math.PI) / 180;
                        const lng1Rad = (p1[1] * Math.PI) / 180;
                        const lat2Rad = (p2[0] * Math.PI) / 180;
                        const lng2Rad = (p2[1] * Math.PI) / 180;
                        
                        totalArea += (lng2Rad - lng1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
                    }
                    
                    // Mutlakkan hasil perkalian dengan skala area radius bumi
                    totalArea = Math.abs((totalArea * RADIUS_BUMI * RADIUS_BUMI) / 2.0);
                    
                    // Memasukkan hasil hitungan bulat ke kolom Luas Lahan form utama
                    nextState.luas_m2 = Math.round(totalArea);
                }
            }

            return nextState;
        });

        // Tutup modal peta kembali
        setMapConfig({ isOpen: false, mode: null });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.id_pemilik || !formData.id_tanaman) {
            alert("Harap tentukan master data pemilik dan jenis tanaman!");
            return;
        }

        // KUNCI PERBAIKAN 2: Mengirim payload yang persis dicari oleh App.jsx
        const finalPayload = {
            lokasi: formData.lokasi,
            luas_m2: parseFloat(formData.luas_m2) || 0,
            id_pemilik: formData.id_pemilik,
            id_tanaman: formData.id_tanaman,
            
            // App.jsx (baris 214) SANGAT MEMBUTUHKAN ini untuk menyimpan Polygon
            // Format array mentah [Lng, Lat]
            raw_coordinates: formData.polygonCoords.length >= 3 
                ? formData.polygonCoords.map(p => [p[1], p[0]]) 
                : [],
            
            // Format 1: Koordinat string biasa "Lat,Lng" untuk penanda marker standar
            koordinat: formData.pointCoord ? `${formData.pointCoord[0]},${formData.pointCoord[1]}` : null,
            
            // Format 2: Array GeoJSON [Lng, Lat] untuk kompatibilitas spasial database backend
            koordinat_klik: formData.pointCoord ? [formData.pointCoord[1], formData.pointCoord[0]] : null, 

            // Format GeoJSON Polygon standar: Membalik kembali [Lat,Lng] Leaflet menjadi [Lng,Lat] DB
            geom: formData.polygonCoords.length >= 3 ? {
                type: "Polygon",
                coordinates: [
                    [
                        ...formData.polygonCoords.map(p => [p[1], p[0]]), 
                        [formData.polygonCoords[0][1], formData.polygonCoords[0][0]]
                    ]
                ]
            } : null
        };

        onSave(finalPayload);
    };

    // Styling CSS-in-JS modern agar form berjarak lega dan proporsional
    const styles = {
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '18px',
            width: '100%'
        },
        label: {
            fontWeight: '600',
            color: '#1b5e20',
            marginBottom: '8px',
            fontSize: '14px',
            textAlign: 'left'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #cccccc',
            borderRadius: '12px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff'
        },
        inputWithButton: {
            width: '100%',
            padding: '12px',
            border: '1px solid #cccccc',
            borderRadius: '12px 0 0 12px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            flex: 1
        },
        inputReadonly: {
            width: '100%',
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '12px 0 0 12px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            color: '#444444',
            flex: 1
        },
        actionButton: {
            padding: '0 18px',
            height: '47px',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div 
                    className="modal-box" 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        padding: '30px', 
                        maxWidth: '460px',
                        width: '90%',
                        borderRadius: '24px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }}
                >
                    <h2 style={{ textAlign: 'center', color: '#2e7d32', marginBottom: '25px', fontSize: '22px', fontWeight: '700' }}>
                        {isEditMode ? 'Ubah Manajemen Lahan' : 'Tambah Register Lahan'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* 1. Nama Pemilik Lahan */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nama Pemilik Lahan *</label>
                            <select 
                                name="id_pemilik" 
                                value={formData.id_pemilik} 
                                onChange={handleChange} 
                                required
                                style={styles.input}
                            >
                                <option value="">-- Pilih Pemilik Lahan --</option>
                                {owners.map(o => (
                                    <option key={o.id_pemilik || o.id} value={o.id_pemilik || o.id}>
                                        {o.nama_pemilik} ({o.nik || 'No NIK'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Jenis Tanaman */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Jenis Tanaman *</label>
                            <select 
                                name="id_tanaman" 
                                value={formData.id_tanaman} 
                                onChange={handleChange} 
                                required
                                style={styles.input}
                            >
                                <option value="">-- Pilih Jenis Tanaman --</option>
                                {plants.map(p => (
                                    <option key={p.id_tanaman || p.id} value={p.id_tanaman || p.id}>
                                        {p.jenis_tanaman}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Lokasi Lahan */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Lokasi Lahan</label>
                            <input 
                                type="text" 
                                name="lokasi"
                                placeholder="Contoh: Blok B Sawah Barat, Sukadana" 
                                value={formData.lokasi} 
                                onChange={handleChange} 
                                style={styles.input}
                            />
                        </div>

                        {/* 4. Koordinat */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Titik Koordinat Pusat Lahan *</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    name="geom_display"
                                    placeholder="Belum Ditentukan"
                                    value={formData.geom_display}
                                    readOnly
                                    required
                                    style={styles.inputReadonly}
                                />
                                <button
                                    type="button"
                                    onClick={() => openMap('point')}
                                    style={styles.actionButton}
                                >
                                    📍 Tentukan Point
                                </button>
                            </div>
                        </div>

                        {/* 5. Luas Lahan */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Luas Lahan (Meter Persegi - m²)</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="number" 
                                    name="luas_m2"
                                    step="any"
                                    placeholder="Contoh: 7500 (Atau gunakan peta)" 
                                    value={formData.luas_m2} 
                                    onChange={handleChange} 
                                    style={styles.inputWithButton}
                                />
                                <button
                                    type="button"
                                    onClick={() => openMap('polygon')}
                                    style={styles.actionButton}
                                >
                                    ▱ Gambar Polygon
                                </button>
                            </div>
                        </div>

                        {/* Tombol Aksi Simpan / Batal */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '30px', width: '100%' }}>
                            <button 
                                type="button" 
                                onClick={onClose}
                                style={{
                                    flex: 1, padding: '12px 0', backgroundColor: '#f5f5f5', color: '#666666',
                                    border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600'
                                }}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                style={{
                                    flex: 1, padding: '12px 0', backgroundColor: '#2e7d32', color: 'white',
                                    border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600'
                                }}
                            >
                                {isEditMode ? 'Simpan Perubahan' : 'Simpan Lahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Pemanggilan Modal Peta Tunggal */}
            {mapConfig.isOpen && (
                <MapPickerModal
                    isOpen={mapConfig.isOpen}
                    mode={mapConfig.mode}
                    currentCoords={formData.polygonCoords}
                    currentPoint={formData.pointCoord}
                    onCancel={() => setMapConfig({ isOpen: false, mode: null })}
                    onConfirm={handleMapConfirm}
                />
            )}
        </>
    );
}