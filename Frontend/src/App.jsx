import { useState } from 'react';

import Map from './components/Map';
import SidebarLeft from './components/SidebarLeft';
import CoordinateSearch from './components/CoordinateSearch'; // 1. TAMBAHKAN IMPORT INI

import OwnerPanel from './components/OwnerPanel';
import PlantPanel from './components/PlantPanel';

import LahanForm from './components/LahanForm';
import FasilitasForm from './components/FasilitasForm';

import './App.css';

export default function App() {

    /* ==========================================================
        STATE
    ========================================================== */
    const [showLahan, setShowLahan] = useState(false);
    const [showFasilitas, setShowFasilitas] = useState(false);

    /* ==========================================================
        HANDLER
    ========================================================== */
    const handleSaveLahan = (data) => {
        console.log("Simpan Lahan:", data);
        setShowLahan(false);
    };

    const handleSaveFasilitas = (data) => {
        console.log("Simpan Fasilitas:", data);
        setShowFasilitas(false);
    };

    // 2. TAMBAHKAN HANDLER UNTUK PENCARIAN KOORDINAT
    const handleCoordinateSearch = (coords) => {
        console.log("Mencari Koordinat:", coords);
        // Di sini nanti Anda bisa menambahkan logic untuk menggerakkan peta (flyTo)
        // Jika menggunakan Leaflet, biasanya lewat referensi Map.
    };

    const scrollToData = () => {
        const section = document.querySelector(".data-section");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="layout">

            {/* SIDEBAR */}
            <SidebarLeft
                onAddLahan={() => setShowLahan(true)}
                onAddFasilitas={() => setShowFasilitas(true)}
            />

            <main className="main-content">

                {/* MAP SECTION */}
                <section className="map-section">
                    
                    {/* 3. PANGGIL KOMPONEN DI SINI AGAR MUNCUL DI ATAS PETA */}
                    <CoordinateSearch onSearch={handleCoordinateSearch} />

                    {/* MAP WRAPPER */}
                    <div className="map-area">
                        <Map />
                    </div>

                    {/* Overlay */}
                    <div className="map-overlay"></div>

                    {/* Scroll Button */}
                    <button className="scroll-down-btn" onClick={scrollToData}>
                        ↓ Detail Data Atribut
                    </button>

                </section>

                {/* DATA SECTION */}
                <section className="data-section">
                    <div className="section-header">
                        <h2>Detail Data Atribut</h2>
                        <p>Kelola data pemilik lahan dan komoditas tanaman secara terintegrasi dengan GIS.</p>
                    </div>

                    <div className="bottom-panels-container">
                        <OwnerPanel />
                        <PlantPanel />
                    </div>
                </section>

            </main>

            {/* MODALS */}
            {showLahan && (
                <LahanForm
                    onClose={() => setShowLahan(false)}
                    onSave={handleSaveLahan}
                />
            )}

            {showFasilitas && (
                <FasilitasForm
                    onClose={() => setShowFasilitas(false)}
                    onSave={handleSaveFasilitas}
                />
            )}

        </div>
    );
}