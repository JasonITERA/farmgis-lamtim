// src/components/MapPickerModal.jsx
import { useState } from 'react'; 
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon marker default Leaflet yang sering hilang di React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// PERBAIKAN: Menghapus variabel 'mode' yang tidak terpakai agar ESLint tidak error
function MapEventsHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        },
    });
    return null;
}

export default function MapPickerModal({ isOpen, mode, currentCoords, currentPoint, onCancel, onConfirm }) {
    const defaultCenter = [-5.4000, 105.2600]; 
    const initialCenter = currentPoint && currentPoint.length === 2 ? currentPoint : defaultCenter;

    const [tempPoint, setTempPoint] = useState(currentPoint || null);
    const [tempPolygon, setTempPolygon] = useState(currentCoords || []);

    // Fungsi penanganan klik peta yang diikat dengan state lokal modal
    const handleMapClick = (lat, lng) => {
        if (mode === 'point') {
            setTempPoint([lat, lng]);
        } else if (mode === 'polygon') {
            setTempPolygon((prev) => [...prev, [lat, lng]]);
        }
    };

    const handleClear = () => {
        if (mode === 'point') setTempPoint(null);
        if (mode === 'polygon') setTempPolygon([]);
    };

    const handleConfirmSelection = () => {
        if (mode === 'point' && !tempPoint) {
            alert("Silakan klik area pada peta terlebih dahulu untuk menandai koordinat!");
            return;
        }
        if (mode === 'polygon' && tempPolygon.length < 3) {
            alert("Poligon minimal membutuhkan 3 titik sudut untuk membentuk area wilayah!");
            return;
        }
        onConfirm(tempPolygon, tempPoint);
    };

    if (!isOpen) return null;

    const modalStyles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 9999
        },
        container: {
            backgroundColor: 'white', padding: '24px', borderRadius: '16px',
            width: '90%', maxWidth: '750px', display: 'flex', flexDirection: 'column',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box'
        },
        header: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px'
        },
        toolbar: {
            display: 'flex', gap: '10px', marginBottom: '12px', justifyContent: 'space-between'
        },
        mapWrapper: {
            width: '100%', height: '380px', position: 'relative', 
            borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd'
        },
        footer: {
            display: 'flex', justifyContent: 'flex-end', gap: '12px',
            marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '15px'
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.container}>
                
                <div style={modalStyles.header}>
                    <h3 style={{ margin: 0, color: '#1b5e20', fontWeight: '700' }}>
                        {mode === 'point' ? '📍 Tentukan Titik Koordinat Pusat' : '▱ Gambar Batas Poligon Lahan'}
                    </h3>
                    <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>&times;</button>
                </div>

                <div style={modalStyles.toolbar}>
                    <span style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center' }}>
                        {mode === 'point' 
                            ? '💡 Petunjuk: Klik 1x pada peta untuk menaruh penanda lokasi.' 
                            : `💡 Petunjuk: Klik berurutan untuk membentuk wilayah (Total: ${tempPolygon.length} titik).`
                        }
                    </span>
                    {(tempPoint || tempPolygon.length > 0) && (
                        <button 
                            type="button" 
                            onClick={handleClear}
                            style={{ padding: '6px 12px', backgroundColor: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                            🗑️ Bersihkan Gambar
                        </button>
                    )}
                </div>

                <div style={modalStyles.mapWrapper}>
                    <MapContainer 
                        center={initialCenter} 
                        zoom={14} 
                        style={{ width: '100%', height: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* PERBAIKAN: Memanggil handler tanpa melemparkan prop mode yang menganggur */}
                        <MapEventsHandler onMapClick={handleMapClick} />

                        {mode === 'point' && tempPoint && (
                            <Marker position={tempPoint} icon={DefaultIcon} />
                        )}

                        {mode === 'polygon' && tempPolygon.length > 0 && (
                            <>
                                <Polygon 
                                    positions={tempPolygon} 
                                    pathOptions={{ color: '#2e7d32', fillColor: '#4caf50', fillOpacity: 0.4 }} 
                                />
                                {tempPolygon.map((pos, index) => (
                                    <Marker key={`node-${index}`} position={pos} icon={DefaultIcon} />
                                ))}
                            </>
                        )}
                    </MapContainer>
                </div>

                <div style={modalStyles.footer}>
                    <button 
                        type="button" 
                        onClick={onCancel}
                        style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', color: '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Batal
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirmSelection}
                        style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        ✔️ Konfirmasi Pilihan
                    </button>
                </div>

            </div>
        </div>
    );
}