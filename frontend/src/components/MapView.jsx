import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PRISHTINA = [42.6629, 21.1655];

export function MapView({ events, height = '400px', center }) {
  const withLocation = events.filter((e) => e.lat != null && e.lng != null);
  const mapCenter = center || (withLocation[0] ? [withLocation[0].lat, withLocation[0].lng] : PRISHTINA);

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <Link to={`/events/${event.id}`} className="font-medium text-violet-600">
                {event.title}
              </Link>
              <div className="text-xs text-gray-500">{event.location}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
