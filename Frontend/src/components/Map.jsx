// src/components/Map.jsx
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    useMap
} from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Icon Marker agar muncul dengan benar di React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/* ==========================================================
    PERBAIKAN UTAMA: ChangeView dengan Pelindung Sumbu Kamera
========================================================== */
function ChangeView({ center }) {
    const map = useMap();

    useEffect(() => {
        if (!center || !Array.isArray(center) || center.length < 2) return;

        let lat = Number(center[0]);
        let lng = Number(center[1]);

        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

        // PENGUNCI TRICKY: Jika angka pertama bermisalkan ratusan (105.xxx)
        // Berarti data pusat 'center' dari App.jsx dikirim terbalik [Lng, Lat].
        // Kita balik paksa menjadi [Lat, Lng] agar kamera tidak terbang ke Kutub Utara!
        if (Math.abs(lat) > 90) {
            const temp = lat;
            lat = lng;
            lng = temp;
        }

        // Jalankan animasi pergeseran kamera secara aman
        map.flyTo([lat, lng], 16, { 
            duration: 1.5,
            animate: true
        });
    }, [center, map]);

    return null;
}

/* ==========================================================
    HELPER FUNCTION: Penyelaras Sumbu Koordinat Lahan
========================================================== */
function extractLeafletCoords(item) {
    if (!item) return [];

    try {
        const geojson = item.geom_data || item.geojson_polygon || item.geom || item.raw_geojson || item.geojson_point || item.geometry;
        
        if (geojson && geojson.coordinates && Array.isArray(geojson.coordinates)) {
            if (geojson.type === "Point") {
                const valA = Number(geojson.coordinates[0]);
                const valB = Number(geojson.coordinates[1]);
                if (Math.abs(valA) > 90) return [[valB, valA]];
                return [[valA, valB]];
            }

            if (geojson.type === "Polygon" || Array.isArray(geojson.coordinates[0])) {
                let rawRing = geojson.coordinates[0];
                if (Array.isArray(rawRing[0]) && Array.isArray(rawRing[0][0])) {
                    rawRing = rawRing[0];
                }

                const mappedCoords = rawRing
                    .filter(coord => coord && coord.length >= 2)
                    .map(coord => {
                        const valA = Number(coord[0]);
                        const valB = Number(coord[1]);
                        if (Math.abs(valA) > 90) return [valB, valA]; 
                        return [valA, valB];
                    })
                    .filter(c => !isNaN(c[0]) && !isNaN(c[1]) && c[0] !== 0 && c[1] !== 0);

                if (mappedCoords.length > 3 && 
                    mappedCoords[0][0] === mappedCoords[mappedCoords.length - 1][0] && 
                    mappedCoords[0][1] === mappedCoords[mappedCoords.length - 1][1]) {
                    return mappedCoords.slice(0, -1);
                }
                return mappedCoords;
            }
        }

        if (item.polygonCoords && Array.isArray(item.polygonCoords) && item.polygonCoords.length > 0) {
            return item.polygonCoords; 
        }
        if (item.pointCoord && Array.isArray(item.pointCoord) && item.pointCoord.length === 2) {
            return [item.pointCoord];
        }

        if ((item.lat || item.latitude) && (item.lng || item.longitude)) {
            const lat = Number(item.lat || item.latitude);
            const lng = Number(item.lng || item.longitude);
            if (!isNaN(lat) && !isNaN(lng)) return [[lat, lng]];
        }

        const rawCoords = item.polygon_coords || item.polygon_koordinat || item.koordinat_klik;
        if (rawCoords && Array.isArray(rawCoords) && rawCoords.length > 0) {
            const target = Array.isArray(rawCoords[0]?.[0]) ? rawCoords[0] : rawCoords;
            return target
                .map(coord => {
                    const valA = Number(coord[0]);
                    const valB = Number(coord[1]);
                    if (Math.abs(valA) > 90) return [valB, valA];
                    return [valA, valB];
                })
                .filter(c => !isNaN(c[0]) && !isNaN(c[1]));
        }

        const coordString = item.Koordinat || item.koordinat || item.string_koordinat;
        if (typeof coordString === 'string' && coordString.trim() !== '') {
            const parts = coordString.split('|');
            return parts
                .map((part) => {
                    const pieces = part.split(',');
                    if (pieces.length < 2) return null;
                    const valA = Number(pieces[0]);
                    const valB = Number(pieces[1]);
                    if (Math.abs(valA) > 90) return [valB, valA];
                    return (isNaN(valA) || isNaN(valB)) ? null : [valA, valB];
                })
                .filter(Boolean);
        }
    } catch (error) {
        console.error("Gagal melakukan kalkulasi koordinat spasial:", error);
    }
    return [];
}

/* ==========================================================
    MAIN COMPONENT: Map
========================================================== */
export default function Map({
    center,
    dataLahan = [],
    dataFasilitas = []
}) {
    // Validasi titik fokus utama
    let validCenter = center && center[0] !== 0 && center[1] !== 0 && !isNaN(center[0]) ? center : [-5.113, 105.306];
    
    // Pastikan fallback center awal jika dikirim terbalik dari App.jsx
    if (Math.abs(validCenter[0]) > 90) {
        validCenter = [validCenter[1], validCenter[0]];
    }

    return (
        <MapContainer
            center={validCenter} 
            zoom={13}
            style={{ width: '100%', height: '100%' }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pemicu animasi geser kamera otomatis */}
            <ChangeView center={center} />

            {/* ==================== RENDER DATA LAHAN ==================== */}
            {dataLahan.map((item, index) => {
                const coords = extractLeafletCoords(item);
                const uniqueKey = item.id_lahan || item.id || `lahan-idx-${index}`;

                if (!coords || coords.length === 0) return null;

                // Render Point Marker
                if (coords.length === 1) {
                    return (
                        <Marker key={`marker-${uniqueKey}`} position={coords[0]}>
                            <Popup>
                                <div style={{ minWidth: '140px' }}>
                                    <b style={{ color: '#2e7d32' }}>{item.nama_pemilik || item.Pemilik || "Lahan"}</b><br />
                                    <span><b>Lokasi:</b> {item.lokasi || "-"}</span><br />
                                    <span><b>Luas:</b> {item.luas_m2 ? `${(item.luas_m2 / 10000).toFixed(2)} Ha` : "-"}</span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }

                // Render Polygon Area
                return (
                    <Polygon 
                        key={`poly-${uniqueKey}`} 
                        positions={coords}
                        pathOptions={{ 
                            color: '#2e7d32', 
                            fillColor: '#4caf50',
                            fillOpacity: 0.4,
                            weight: 2
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: '140px' }}>
                                <b style={{ color: '#2e7d32', fontSize: '1.1em' }}>{item.nama_pemilik || "Lahan"}</b><br />
                                <hr style={{ margin: '5px 0', border: '0.5px solid #eee' }} />
                                <span><b>Lokasi:</b> {item.lokasi || "-"}</span><br />
                                <span><b>Luas:</b> {item.luas_m2 ? `${item.luas_m2} m² (${(item.luas_m2 / 10000).toFixed(2)} Ha)` : "-"}</span><br />
                                <span><b>Tanaman:</b> {item.jenis_tanaman || "-"}</span>
                            </div>
                        </Popup>
                    </Polygon>
                );
            })}

            {/* ==================== RENDER DATA FASILITAS ==================== */}
            {dataFasilitas.map((item, index) => {
                const coords = extractLeafletCoords(item);
                if (!coords || coords.length === 0) return null;

                const uniqueKey = item.id_fasilitas || item.id || `fas-idx-${index}`;

                return (
                    <Marker key={`fas-${uniqueKey}`} position={coords[0]}>
                        <Popup>
                            <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                <b style={{ color: '#d32f2f' }}>{item.nama_fasilitas || item.nama}</b><br />
                                <span style={{ fontSize: '0.9em', color: '#555' }}>{item.jenis_fasilitas || 'Fasilitas umum'}</span><br />
                                <small style={{ color: '#888', fontSize: '0.8em' }}>📍 {coords[0][0].toFixed(5)}, {coords[0][1].toFixed(5)}</small>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}