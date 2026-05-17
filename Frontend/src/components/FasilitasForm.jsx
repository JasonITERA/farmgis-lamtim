// src/components/FasilitasForm.jsx
import { useState } from 'react';
import MapPickerModal from './MapPickerModal';

export default function FasilitasForm({ onClose, onSave, editData }) {
    
    // 1. Fungsi pembantu mengekstrak data lama saat mode edit
    const extractInitialValues = (data) => {
        let latVal = '';
        let lngVal = '';
        
        if (data) {
            // Cek struktur dari GeoJSON Point terlebih dahulu
            if (data.geojson_point?.coordinates && Array.isArray(data.geojson_point.coordinates)) {
                // GeoJSON menggunakan urutan [Longitude, Latitude]
                lngVal = data.geojson_point.coordinates[0];
                latVal = data.geojson_point.coordinates[1];
            } 
            // Jika tidak ada, pakai fallback properti datar lng & lat angka murni
            else {
                latVal = data.lat || data.latitude || '';
                lngVal = data.lng || data.longitude || '';
            }
        }

        return {
            nama_fasilitas: data?.nama_fasilitas || data?.nama || '',
            jenis_fasilitas: data?.jenis_fasilitas || data?.jenis || '',
            lat: latVal,
            lng: lngVal,
            geom_display: latVal && lngVal ? `${latVal}, ${lngVal}` : ''
        };
    };

    // 2. Inisialisasi state awal form langsung menggunakan helper
    const [formData, setFormData] = useState(() => extractInitialValues(editData));
    const [showMapPicker, setShowMapPicker] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const finalLat = parseFloat(formData.lat);
        const finalLng = parseFloat(formData.lng);

        if (isNaN(finalLat) || isNaN(finalLng)) {
            alert("Silakan pilih lokasi koordinat fasilitas terlebih dahulu via peta!");
            return;
        }

        // Susun payload GeoJSON terstruktur murni untuk dikirim kembali ke App.jsx
        const finalPayload = {
            // Sediakan ID lama jika sedang dalam mode edit data agar tidak membuat baris baru di DB
            id_fasilitas: editData?.id_fasilitas || editData?.id || undefined,
            nama_fasilitas: formData.nama_fasilitas,
            jenis_fasilitas: formData.jenis_fasilitas,
            geojson_point: {
                type: "Point",
                coordinates: [finalLng, finalLat] // Format GeoJSON Wajib: [Longitude, Latitude]
            }
        };

        console.log("🚀 Data Terstruktur Siap Dikirim ke Backend via App.jsx:", finalPayload); 
        onSave(finalPayload);
    };

    // Menerima kiriman data dari MapPickerModal pasca-konfirmasi tombol klik
    const handleSelectLocation = (tempPolygon, tempPoint) => {
        // Karena Fasilitas adalah Point, kita fokus membaca parameter tempPoint
        if (!tempPoint || !Array.isArray(tempPoint) || tempPoint.length < 2) {
            alert("Terjadi kesalahan: MapPicker tidak mengembalikan koordinat point yang valid!");
            return;
        }

        const finalLat = parseFloat(tempPoint[0]);
        const finalLng = parseFloat(tempPoint[1]);

        setFormData((prev) => ({
            ...prev,
            lat: finalLat,
            lng: finalLng,
            geom_display: `${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}` 
        }));
        
        setShowMapPicker(false);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-box"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2
                        style={{
                            textAlign: 'center',
                            color: '#2e7d32',
                            marginBottom: '20px'
                        }}
                    >
                        {editData ? 'Edit Data Fasilitas' : 'Tambah Data Fasilitas'}
                    </h2> 

                    <form onSubmit={handleSubmit}>
                        {/* Nama Fasilitas */}
                        <div className="full-width">
                            <label className="label-green">Nama Fasilitas</label>
                            <input
                                type="text"
                                name="nama_fasilitas"
                                placeholder="Contoh: Gudang Pupuk A"
                                value={formData.nama_fasilitas}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Jenis Fasilitas */}
                        <div className="full-width">
                            <label className="label-green">Jenis Fasilitas</label>
                            <input
                                type="text"
                                name="jenis_fasilitas"
                                placeholder="Contoh: Penyimpanan"
                                value={formData.jenis_fasilitas}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Titik Koordinat */}
                        <div className="full-width">
                            <label className="label-green">Titik Koordinat</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="geom_display"
                                    placeholder="Klik tombol lokasi..."
                                    value={formData.geom_display}
                                    readOnly
                                    required
                                    className="input-readonly"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn-map-trigger"
                                    onClick={() => setShowMapPicker(true)}
                                    style={{
                                        padding: '0 15px',
                                        backgroundColor: '#2e7d32',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    📍 Pilih
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn-save"
                            >
                                {editData ? 'Update Fasilitas' : 'Simpan Fasilitas'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* PERBAIKAN: Penyesuaian nama props agar diserap sempurna oleh MapPickerModal.jsx */}
            <MapPickerModal
                isOpen={showMapPicker}
                mode="point"
                currentPoint={formData.lat && formData.lng ? [parseFloat(formData.lat), parseFloat(formData.lng)] : null}
                currentCoords={[]}
                onConfirm={handleSelectLocation}
                onCancel={() => setShowMapPicker(false)}
            />
        </>
    );
}