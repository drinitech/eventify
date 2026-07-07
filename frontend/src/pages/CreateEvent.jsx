import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAuth } from '../hooks/useAuth';
import { useEvent, useCreateEvent, useUpdateEvent } from '../hooks/useEvents';

const PRISHTINA = [42.6629, 21.1655];
const CATEGORIES = ['koncert', 'konference', 'social', 'workshop', 'sport', 'tjeter'];

function toDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  category: CATEGORIES[0],
  price: 0,
  maxAttendees: '',
  imageUrl: '',
};

export function CreateEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: existingEvent, isLoading: loadingEvent } = useEvent(id);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(id);

  const [form, setForm] = useState(emptyForm);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && existingEvent) {
      setForm({
        title: existingEvent.title,
        description: existingEvent.description,
        date: toDatetimeLocal(existingEvent.date),
        location: existingEvent.location,
        category: existingEvent.category,
        price: Number(existingEvent.price),
        maxAttendees: existingEvent.maxAttendees ?? '',
        imageUrl: existingEvent.imageUrl ?? '',
      });
      if (existingEvent.lat != null && existingEvent.lng != null) {
        setPosition([existingEvent.lat, existingEvent.lng]);
      }
    }
  }, [isEdit, existingEvent]);

  if (isEdit && loadingEvent) {
    return <p className="text-gray-500">Duke ngarkuar...</p>;
  }

  if (isEdit && existingEvent && existingEvent.organizerId !== user.id) {
    return <p className="text-red-600">Nuk ke te drejte te editosh kete event.</p>;
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      location: form.location,
      category: form.category,
      price: Number(form.price),
      ...(form.maxAttendees ? { maxAttendees: Number(form.maxAttendees) } : {}),
      ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
      ...(position ? { lat: position[0], lng: position[1] } : {}),
    };

    try {
      if (isEdit) {
        await updateEvent.mutateAsync(payload);
        navigate(`/events/${id}`);
      } else {
        const created = await createEvent.mutateAsync(payload);
        navigate(`/events/${created.id}`);
      }
    } catch (err) {
      const details = err.response?.data?.details;
      const firstDetail = details && Object.values(details)[0]?.[0];
      setError(firstDetail || err.response?.data?.error || 'Ruajtja deshtoi');
    }
  }

  const saving = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edito eventin' : 'Krijo nje event te ri'}
      </h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titulli</label>
          <input
            required
            value={form.title}
            onChange={update('title')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pershkrimi</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={update('description')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data dhe ora</label>
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={update('date')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
            <select
              value={form.category}
              onChange={update('category')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lokacioni (adresa)</label>
          <input
            required
            value={form.location}
            onChange={update('location')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Piket ne harte (kliko per te vendosur lokacionin, opsionale)
          </label>
          <div style={{ height: '250px' }} className="rounded-md overflow-hidden border border-gray-300">
            <MapContainer center={position || PRISHTINA} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker position={position} onChange={setPosition} />
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cmimi (€, 0 = falas)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={update('price')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max pjesemarres (opsionale)</label>
            <input
              type="number"
              min="1"
              value={form.maxAttendees}
              onChange={update('maxAttendees')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL i fotos (opsionale)</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={update('imageUrl')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium py-2 rounded-md"
        >
          {saving ? 'Duke ruajtur...' : isEdit ? 'Ruaj ndryshimet' : 'Krijo eventin'}
        </button>
      </form>
    </div>
  );
}
