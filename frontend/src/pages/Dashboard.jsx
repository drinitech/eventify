import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyEvents, useDeleteEvent } from '../hooks/useEvents';
import {
  useEventDashboard,
  useAttendees,
  useCheckInTicket,
  useCheckInByQr,
  useBroadcastNotification,
} from '../hooks/useDashboard';

const STATUS_LABEL = {
  RESERVED: 'Rezervuar',
  PAID: 'Konfirmuar',
  CHECKED_IN: 'Check-in i kryer',
  CANCELLED: 'Anulluar',
};

export function Dashboard() {
  const { data: myEvents, isLoading } = useMyEvents();
  const [selectedId, setSelectedId] = useState(null);
  const deleteEvent = useDeleteEvent();

  const eventId = selectedId || myEvents?.[0]?.id;
  const { data: dashboard } = useEventDashboard(eventId);
  const { data: attendees } = useAttendees(eventId);
  const checkIn = useCheckInTicket(eventId);
  const checkInByQr = useCheckInByQr(eventId);
  const broadcast = useBroadcastNotification(eventId);

  const [qrInput, setQrInput] = useState('');
  const [qrError, setQrError] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  if (isLoading) return <p className="text-gray-500">Duke ngarkuar...</p>;

  if (!myEvents || myEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Ende s'ke krijuar asnje event.</p>
        <Link to="/events/new" className="text-violet-600 hover:underline">
          Krijo eventin e pare
        </Link>
      </div>
    );
  }

  async function handleDelete(id) {
    if (!confirm('Je i sigurt qe do ta fshish kete event?')) return;
    await deleteEvent.mutateAsync(id);
    setSelectedId(null);
  }

  async function handleQrSubmit(e) {
    e.preventDefault();
    setQrError('');
    try {
      await checkInByQr.mutateAsync(qrInput);
      setQrInput('');
    } catch (err) {
      setQrError(err.response?.data?.error || 'Check-in deshtoi');
    }
  }

  async function handleBroadcast(e) {
    e.preventDefault();
    setBroadcastStatus('');
    try {
      await broadcast.mutateAsync(broadcastMessage);
      setBroadcastMessage('');
      setBroadcastStatus('Mesazhi u dergua tek pjesemarresit.');
    } catch (err) {
      setBroadcastStatus(err.response?.data?.error || 'Dergimi deshtoi');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">Eventet e mia</h2>
        {myEvents.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setSelectedId(ev.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm border ${
              ev.id === eventId ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium truncate">{ev.title}</div>
            <div className="text-xs text-gray-400">{ev._count?.tickets || 0} bileta</div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 space-y-6">
        {dashboard && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">{dashboard.event.title}</h1>
              <div className="flex gap-2">
                <Link
                  to={`/events/${eventId}/edit`}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-100"
                >
                  Edito
                </Link>
                <button
                  onClick={() => handleDelete(eventId)}
                  className="text-sm border border-red-300 text-red-600 rounded-md px-3 py-1.5 hover:bg-red-50"
                >
                  Fshij
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                ['Regjistruar', dashboard.stats.registered],
                ['Bileta shitur', dashboard.stats.ticketsSold],
                ['Check-in', dashboard.stats.checkedIn],
                ['Anulluar', dashboard.stats.cancelled],
                ['Vende te lira', dashboard.stats.spotsRemaining ?? '∞'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Check-in me skanim QR</h3>
              <form onSubmit={handleQrSubmit} className="flex gap-2">
                <input
                  required
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Ngjit vleren e QR code-it"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={checkInByQr.isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-1.5 rounded-md disabled:opacity-50"
                >
                  Check-in
                </button>
              </form>
              {qrError && <p className="text-sm text-red-600 mt-2">{qrError}</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dergo njoftim tek pjesemarresit</h3>
              <form onSubmit={handleBroadcast} className="flex gap-2">
                <input
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="p.sh. Ndryshim ne oraret e eventit..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={broadcast.isPending}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-1.5 rounded-md disabled:opacity-50"
                >
                  Dergo
                </button>
              </form>
              {broadcastStatus && <p className="text-sm text-gray-500 mt-2">{broadcastStatus}</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-sm font-semibold text-gray-700 px-4 py-3 border-b border-gray-200">
                Pjesemarresit
              </h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-2">Emri</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Statusi</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {attendees?.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-4 py-2">{a.user.name}</td>
                      <td className="px-4 py-2 text-gray-500">{a.user.email}</td>
                      <td className="px-4 py-2">{STATUS_LABEL[a.status]}</td>
                      <td className="px-4 py-2 text-right">
                        {a.status === 'PAID' && (
                          <button
                            onClick={() => checkIn.mutate(a.id)}
                            className="text-xs text-violet-600 hover:underline"
                          >
                            Check-in manual
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attendees?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                        Ende pa pjesemarres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
