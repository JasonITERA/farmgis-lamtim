import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'

function ChangeView({ center }) {
const map = useMap()

useEffect(() => {
    if (center) {
    map.setView(center, 17)
    }
}, [center, map])

return null
}

export default function Map({ center }) {
return (
    <MapContainer
    center={[-5.113, 105.306]}
    zoom={11}
    style={{ width: '100%', height: '100%' }}
    >
    <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <ChangeView center={center} />
    </MapContainer>
)
}