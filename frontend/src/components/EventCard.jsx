import { Link } from 'react-router-dom';

const dateFormatter = new Intl.DateTimeFormat('sq-AL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function EventCard({ event }) {
  const price = Number(event.price);

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">Pa foto</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">
            {event.category}
          </span>
          <span className="text-xs text-gray-500">
            {price === 0 ? 'Falas' : `€${price.toFixed(2)}`}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{dateFormatter.format(new Date(event.date))}</p>
        <p className="text-sm text-gray-500 truncate">{event.location}</p>
        {event.organizer && (
          <p className="text-xs text-gray-400 mt-2">nga {event.organizer.name}</p>
        )}
      </div>
    </Link>
  );
}
