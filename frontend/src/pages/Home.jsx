import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { EventCard } from '../components/EventCard';
import { MapView } from '../components/MapView';
import { useEvents } from '../hooks/useEvents';

export function Home() {
  const [filters, setFilters] = useState({ page: 1, limit: 12 });
  const [showMap, setShowMap] = useState(false);
  const { data, isLoading, isError } = useEvents(filters);

  const events = data?.events || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Zbulo evente</h1>
        <button
          onClick={() => setShowMap((s) => !s)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-100"
        >
          {showMap ? 'Fshih harten' : 'Shfaq harten'}
        </button>
      </div>

      <SearchBar filters={filters} onChange={setFilters} />

      {showMap && (
        <div className="mb-6">
          <MapView events={events} />
        </div>
      )}

      {isLoading && <p className="text-gray-500">Duke ngarkuar eventet...</p>}
      {isError && <p className="text-red-600">Ndodhi nje gabim gjate ngarkimit te eventeve.</p>}

      {!isLoading && events.length === 0 && (
        <p className="text-gray-500">Nuk u gjeten evente per keto filtra.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Mbrapa
          </button>
          <span className="text-sm text-gray-500">
            Faqja {pagination.page} nga {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Perpara
          </button>
        </div>
      )}
    </div>
  );
}
