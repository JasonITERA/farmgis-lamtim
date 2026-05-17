// src/App.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Map from './components/Map'
import SidebarLeft from './components/SidebarLeft'
import CoordinateSearch from './components/CoordinateSearch'
import OwnerPanel from './components/OwnerPanel'
import PlantPanel from './components/PlantPanel'
import LahanForm from './components/LahanForm'
import FasilitasForm from './components/FasilitasForm'
import { apiService } from './services/api'
import './App.css'

export default function App() {
    const [showLahan, setShowLahan] = useState(false)
    const [showFasilitas, setShowFasilitas] = useState(false)
    const [editDataLahan, setEditDataLahan] = useState(null)
    const [editDataFasilitas, setEditDataFasilitas] = useState(null)
    const [mapCenter, setMapCenter] = useState(null)

    // MASTER DATA STATE
    const [owners, setOwners] = useState([])
    const [plants, setPlants] = useState([])
    const [dataLahan, setDataLahan] = useState([])
    const [dataFasilitas, setDataFasilitas] = useState([])

    const isInitialized = useRef(false)

    /* ==========================================================
       [PARSER] NORMALISASI DATA LAHAN UNIVERSAL
    ========================================================== */
    const parseDataLahanUniversal = useCallback((rawData) => {
        if (!rawData) return [];
        const actualData = rawData.data || rawData;
        let extractedItems;

        if (actualData.features && Array.isArray(actualData.features)) {
            extractedItems = actualData.features.map(feat => ({
                ...feat.properties,
                geom_data: feat.geometry
            }));
        } else if (Array.isArray(actualData)) {
            extractedItems = actualData.map(item => ({
                ...item,
                geom_data: item.geojson_polygon || item.geom
            }));
        } else {
            console.warn("⚠️ Format data lahan tidak dikenali:", rawData);
            return [];
        }

        return extractedItems.map((props, index) => {
            let koordinatTxt = "0, 0";
            if (props.koordinat_klik && Array.isArray(props.koordinat_klik) && props.koordinat_klik.length >= 2) {
                const lng = props.koordinat_klik[0];
                const lat = props.koordinat_klik[1];
                koordinatTxt = lng < 0 ? `${lng}, ${lat}` : `${lat}, ${lng}`;
            }

            const luasM2 = props.luas_m2 || 0;
            const namaPemilikStr = props.nama_pemilik || props.pemilik || "Tanpa Nama";
            const namaTanamanStr = props.jenis_tanaman || props.tanaman || "Belum Ditanam";

            return {
                id: props.id_lahan || props.id || index,
                id_lahan: props.id_lahan || props.id,
                idLahan: props.id_lahan || props.id,
                lokasi: props.lokasi || "Lahan " + (index + 1),
                Luas: `${(luasM2 / 10000).toFixed(4)} Ha`,
                luas_m2: luasM2,
                nama_pemilik: namaPemilikStr,
                jenis_tanaman: namaTanamanStr,
                masa_tanam: props.masa_tanam || "-",
                geom: props.geom_data,
                geojson_polygon: props.geom_data,
                koordinat: koordinatTxt,
                Koordinat: koordinatTxt
            };
        });
    }, []);

    /* ==========================================================
       [READ] REFRESH DATA: Sinkronisasi Aktif dari Database
    ========================================================== */
    const refreshAllData = useCallback(async () => {
        try {
            console.log("🔄 Menyegarkan seluruh data dari database...");
            
            // 1. Refresh Data Lahan
            const resLahan = await fetch("http://localhost:8000/api/lahan/peta"); 
            if (resLahan.ok) {
                const rawLahanData = await resLahan.json();
                const cleanData = parseDataLahanUniversal(rawLahanData);
                setDataLahan(cleanData);
            }

            // 2. Refresh Data Fasilitas (FIXED: ESLINT NO-USELESS-ASSIGNMENT)
            const resFasilitas = await fetch("http://localhost:8000/api/fasilitas/peta"); 
            if (resFasilitas.ok) {
                const rawFasilitasData = await resFasilitas.json();
                const baseData = rawFasilitasData.features || rawFasilitasData.data || rawFasilitasData;
                
                let cleanFasilitas = [];
                if (Array.isArray(baseData)) {
                    cleanFasilitas = baseData.map((item, index) => {
                        const rawProps = item.properties || item;
                        let geojsonRaw = item.geometry || rawProps.koordinat_titik || rawProps.geojson_point;
                        
                        if (typeof geojsonRaw === 'string') {
                            try {
                                geojsonRaw = JSON.parse(geojsonRaw);
                            } catch (e) {
                                console.error("Gagal parse string GeoJSON", e);
                                geojsonRaw = null;
                            }
                        }

                        let longitude;
                        let latitude;

                        // Ambil koordinat jika objek GeoJSON valid
                        if (geojsonRaw && geojsonRaw.coordinates && Array.isArray(geojsonRaw.coordinates)) {
                            longitude = parseFloat(geojsonRaw.coordinates[0]);
                            latitude = parseFloat(geojsonRaw.coordinates[1]);
                        } else {
                            // Fallback jika database melempar data flat kolom lng dan lat
                            longitude = parseFloat(rawProps.lng || rawProps.longitude || 0);
                            latitude = parseFloat(rawProps.lat || rawProps.latitude || 0);
                        }

                        const namaStr = rawProps.nama_fasilitas || rawProps.nama || "Fasilitas Tanpa Nama";
                        const jenisStr = rawProps.jenis_fasilitas || rawProps.jenis || "Umum";
                        const koordinatStr = `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`;

                        return {
                            id: rawProps.id_fasilitas || rawProps.id || index,
                            id_fasilitas: rawProps.id_fasilitas || rawProps.id,
                            nama_fasilitas: namaStr,
                            nama: namaStr,
                            jenis_fasilitas: jenisStr,
                            jenis: jenisStr,
                            lng: longitude, 
                            lat: latitude,  
                            koordinat: koordinatStr, 
                            geom: geojsonRaw || { type: "Point", coordinates: [longitude, latitude] }
                        };
                    });
                }
                setDataFasilitas(cleanFasilitas);
            }

            // 3. Refresh Data Pemilik
            const resPemilik = await fetch("http://localhost:8000/api/pemilik"); 
            if (resPemilik.ok) {
                const rawPemilikData = await resPemilik.json();
                setOwners(rawPemilikData.data || rawPemilikData);
            }

            // 4. Refresh Data Tanaman
            const resTanaman = await fetch("http://localhost:8000/api/tanaman"); 
            if (resTanaman.ok) {
                const rawTanamanData = await resTanaman.json();
                setPlants(rawTanamanData.data || rawTanamanData);
            }

        } catch (error) {
            console.error("❌ Gagal sinkronisasi global database:", error);
        }
    }, [parseDataLahanUniversal]);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true; 
        refreshAllData();
    }, [refreshAllData]); 

    /* ==========================================================
       HANDLERS (OWNER & PLANT)
    ========================================================== */
    const handleSaveOwner = async (data) => {
        let jenisKelaminClean = "Laki-Laki"; 
        if (data.jenis_kelamin) {
            const jkInput = String(data.jenis_kelamin).trim().toLowerCase();
            if (jkInput.includes("perempuan") || jkInput === "wanita" || jkInput === "p") {
                jenisKelaminClean = "Perempuan";
            }
        }

        const payload = {
            nama_pemilik: data.nama_pemilik,
            nik: String(data.nik).trim(),
            jenis_kelamin: jenisKelaminClean, 
            alamat: data.alamat,
            no_hp: String(data.no_hp).trim()
        };

        const idPemilik = data.id_pemilik || data.id;

        try {
            if (idPemilik) {
                await apiService.update_pemilik(idPemilik, payload);
                alert("Data Pemilik Berhasil Diperbarui!");
            } else {
                await apiService.create_pemilik(payload);
                alert("Data Pemilik Baru Berhasil Disimpan!");
            }
            await refreshAllData(); 
        } catch (error) {
            console.error("❌ Transaksi Gagal:", error);
            alert("Gagal menyimpan data pemilik.");
        }
    };

    const handleDeleteOwner = async (id_pemilik) => {
        if (!window.confirm("Hapus data pemilik ini?")) return;
        try {
            await apiService.delete_pemilik(id_pemilik);
            alert("Data Pemilik Berhasil Dihapus!");
            await refreshAllData(); 
        } catch (error) {
            console.error("Error saat hapus pemilik:", error);
        }
    };

    const handleSavePlant = async (data) => {
        const idTanaman = data.id_tanaman || data.id_master_tanaman || data.idTanaman || data.id;
        const payload = {
            jenis_tanaman: data.jenis_tanaman || data.nama_tanaman || "",
            masa_tanam: data.masa_tanam || data.text_tanam || "3 Bulan"
        };

        try {
            if (idTanaman) {
                await apiService.update_tanaman(idTanaman, payload);
                alert(`Data Tanaman "${payload.jenis_tanaman}" Berhasil Diperbarui!`);
            } else {
                await apiService.create_tanaman(payload);
                alert(`Data Tanaman Baru "${payload.jenis_tanaman}" Berhasil Disimpan!`);
            }
            await refreshAllData();
        } catch (error) {
            console.error("❌ Transaksi Tanaman Gagal!", error);
        }
    };

    const handleDeletePlant = async (id_tanaman) => {
        if (!window.confirm("Hapus data tanaman ini?")) return;
        try {
            await apiService.delete_tanaman(id_tanaman);
            alert("Data Tanaman Berhasil Dihapus!");
            await refreshAllData();
        } catch (error) {
            console.error("Error saat hapus tanaman:", error);
        }
    };

    /* ==========================================================
       [DIRECT API] HANDLERS LAHAN SPASIAL CRUD
    ========================================================== */
    const handleSelectLahan = (lahan) => {
        if (lahan.geom?.coordinates?.[0]?.[0]) {
            const firstPoint = lahan.geom.coordinates[0][0];
            setMapCenter([firstPoint[1], firstPoint[0]]); 
        } else if (lahan.lng && lahan.lat) {
            setMapCenter([lahan.lat, lahan.lng]);
        }
    };

    const handleEditLahan = (lahan) => {
        setShowFasilitas(false);
        setEditDataFasilitas(null);
        
        setEditDataLahan(lahan);
        setShowLahan(true);
    };

    const handleSaveLahan = async (data) => {
        const rawOwnerId = data.id_pemilik || data.idItem || data.idPemilik;
        const rawPlantId = data.id_tanaman || data.id_master_tanaman || data.idTanaman;
        const idPemilikParsed = rawOwnerId ? parseInt(rawOwnerId, 10) : null;
        const idTanamanParsed = rawPlantId ? parseInt(rawPlantId, 10) : null;
        const luasClean = data.luas_m2 ? parseFloat(data.luas_m2) : 0.0;

        if (!idPemilikParsed || !idTanamanParsed) {
            alert("Error: Pemilik dan Jenis Tanaman wajib dipilih!");
            return;
        }

        let mappedCoords = [];
        if (data.raw_coordinates && Array.isArray(data.raw_coordinates)) {
            mappedCoords = data.raw_coordinates.map(pt => [parseFloat(pt[1]), parseFloat(pt[0])]);
        } else if (editDataLahan && editDataLahan.geom?.coordinates) {
            mappedCoords = editDataLahan.geom.coordinates[0];
        }

        if (mappedCoords.length > 0) {
            const first = mappedCoords[0];
            const last = mappedCoords[mappedCoords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                mappedCoords.push([first[0], first[1]]);
            }
        }

        const payloadLahan = {
            lokasi: data.lokasi || "Tidak Diketahui",
            luas_m2: luasClean,
            id_pemilik: idPemilikParsed,
            id_tanaman: idTanamanParsed,
            geojson_polygon: {
                type: "Polygon",
                coordinates: [mappedCoords]
            }
        };

        try {
            const targetIdLahan = editDataLahan?.id_lahan || editDataLahan?.id;
            let response;

            if (editDataLahan && targetIdLahan) {
                response = await fetch(`http://localhost:8000/api/lahan/${targetIdLahan}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadLahan)
                });
            } else {
                response = await fetch("http://localhost:8000/api/lahan", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadLahan)
                });
            }

            if (response.ok) {
                alert("Data Lahan Berhasil Disinkronkan ke PostgreSQL!");
                setShowLahan(false);
                setEditDataLahan(null);
                await refreshAllData();
            } else {
                const errData = await response.json();
                alert(`Gagal menyimpan lahan: ${JSON.stringify(errData.detail || errData)}`);
            }
        } catch (err) {
            console.error("❌ Network Error Lahan:", err);
            alert("Gagal menghubungi server backend.");
        }
    };

    const handleDeleteLahan = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data lahan ini?")) return;
        try {
            const response = await fetch(`http://localhost:8000/api/lahan/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Data Lahan Berhasil Dihapus.");
                await refreshAllData();
            }
        } catch (error) {
            console.error("Gagal menghapus lahan:", error);
        }
    };

    /* ==========================================================
       [DIRECT API] HANDLERS FASILITAS
    ========================================================== */
    const handleSaveFasilitas = async (submittedData) => {
        try {
            const targetIdFasilitas = editDataFasilitas?.id_fasilitas || editDataFasilitas?.id;
            let response;

            const payloadBody = {
                nama_fasilitas: submittedData.nama_fasilitas || submittedData.nama || "Fasilitas Baru",
                jenis_fasilitas: submittedData.jenis_fasilitas || submittedData.jenis || "Umum",
                geojson_point: submittedData.geojson_point
            };

            if (editDataFasilitas && targetIdFasilitas) {
                response = await fetch(`http://localhost:8000/api/fasilitas/${targetIdFasilitas}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadBody)
                });
            } else {
                response = await fetch("http://localhost:8000/api/fasilitas", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadBody)
                });
            }

            if (response.ok) {
                alert("Data Fasilitas Berhasil Disimpan ke PostgreSQL!");
                setShowFasilitas(false);
                setEditDataFasilitas(null);
                await refreshAllData(); 
            } else {
                const errBody = await response.json();
                alert(`Gagal validasi database: ${JSON.stringify(errBody.detail || errBody)}`);
            }
        } catch (error) {
            console.error("❌ Gagal total koneksi server:", error);
            alert("Terjadi kegagalan komunikasi dengan database.");
        }
    };

    const handleDeleteFasilitas = async (id) => {
        if (!window.confirm("Hapus data fasilitas ini dari database?")) return;
        try {
            const response = await fetch(`http://localhost:8000/api/fasilitas/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Data Fasilitas Berhasil Dihapus.");
                await refreshAllData();
            }
        } catch (error) {
            console.error("Gagal menghapus fasilitas:", error);
        }
    };

    const handleEditFasilitas = (data) => {
        setShowLahan(false);
        setEditDataLahan(null);

        setEditDataFasilitas(data);
        setShowFasilitas(true);
    };

    return (
        <div className="layout">
            <SidebarLeft
                onAddLahan={() => { 
                    setShowFasilitas(false); setEditDataFasilitas(null); 
                    setEditDataLahan(null); setShowLahan(true); 
                }}
                onAddFasilitas={() => { 
                    setShowLahan(false); setEditDataLahan(null); 
                    setEditDataFasilitas(null); setShowFasilitas(true); 
                }}
                lahanList={dataLahan}
                fasilitasList={dataFasilitas}
                onDelete={handleDeleteLahan}
                onEdit={handleEditLahan} 
                onSelectLahan={handleSelectLahan}
                onDeleteFasilitas={handleDeleteFasilitas}
                onEditFasilitas={handleEditFasilitas}
            />

            <main className="main-content">
                <section className="map-section">
                    <CoordinateSearch onSearch={(coords) => setMapCenter(coords)} />
                    <div className="map-area">
                        <Map center={mapCenter} dataLahan={dataLahan} dataFasilitas={dataFasilitas} />
                    </div>
                </section>

                <section className="data-section">
                    <div className="bottom-panels-container">
                        <OwnerPanel owners={owners} onSave={handleSaveOwner} onDelete={handleDeleteOwner} />
                        <PlantPanel plants={plants} onSave={handleSavePlant} onDelete={handleDeletePlant} />
                    </div>
                </section>
            </main>
            
            {/* FORM LAHAN */}
            {showLahan && !showFasilitas && (
                <LahanForm 
                    key={editDataLahan?.id_lahan || editDataLahan?.id || 'tambah-lahan-baru'}
                    isEditMode={!!editDataLahan}
                    editData={editDataLahan}
                    owners={owners} 
                    plants={plants} 
                    onClose={() => { setShowLahan(false); setEditDataLahan(null); }} 
                    onSave={handleSaveLahan} 
                />
            )}

            {/* FORM FASILITAS */}
            {showFasilitas && !showLahan && (
                <FasilitasForm 
                    key={editDataFasilitas?.id_fasilitas || editDataFasilitas?.id || 'tambah-fasilitas-baru'}
                    isEditMode={!!editDataFasilitas}
                    editData={editDataFasilitas}
                    onClose={() => { setShowFasilitas(false); setEditDataFasilitas(null); }} 
                    onSave={handleSaveFasilitas} 
                />
            )}
        </div>
    );
}