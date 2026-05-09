import { useState } from 'react'

export default function CoordinateSearch({ onSearch }) {
const [lat, setLat] = useState('')
const [lng, setLng] = useState('')

const handleSearch = () => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
    alert('Masukkan koordinat yang valid')
    return
    }

    onSearch([latitude, longitude])
}

return (
    <div className="map-coordinate-overlay">
    <div className="coordinate-card">
        <div className="coordinate-inputs">
        <div className="input-group-mini">
            <label>Lat</label>
            <input
            type="text"
            placeholder="-5.1234"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            />
        </div>
        <div className="input-group-mini">
            <label>Long</label>
            <input
            type="text"
            placeholder="105.1234"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            />
        </div>
        </div>
        <button className="btn-search-map" onClick={handleSearch}>
        <span>🔍</span> Cari
        </button>
    </div>
    </div>
)
}