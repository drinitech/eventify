import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useUpdateProfile } from '../hooks/useProfile';
import { useMyTickets } from '../hooks/useTickets';
import { useMyFollowing } from '../hooks/useOrganizers';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { TicketQR } from '../components/TicketQR';
import api from '../services/api';

const TABS = ['Profili', 'Biletat e mia', 'Duke ndjekur', 'Njoftimet'];

const TICKET_STATUS_LABEL = {
  RESERVED: 'Rezervuar (pritet konfirmim)',
  PAID: 'Konfirmuar',
  CHECKED_IN: 'Check-in i kryer',
};

export function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const qc = useQueryClient();

  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const { data: tickets } = useMyTickets();
  const { data: following } = useMyFollowing(tab === 'Duke ndjekur');
  const { data: notifData } = useNotifications(tab === 'Njoftimet');
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const cancelTicket = useMutation({
    mutationFn: (eventId) => api.delete(`/events/${eventId}/rsvp`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets', 'mine'] }),
  });

  const unfollow = useMutation({
    mutationFn: (organizerId) => api.delete(`/organizers/${organizerId}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['following', 'mine'] }),
  });

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSaved(false);
    const updated = await updateProfile.mutateAsync(form);
    updateUser(updated);
    setSaved(true);
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profili' && (
        <div className="max-w-md bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emri</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL i fotos</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <p className="text-xs text-gray-400">Email: {user.email} · Roli: {user.role}</p>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
            >
              Ruaj ndryshimet
            </button>
            {saved && <p className="text-sm text-green-600">U ruajt!</p>}
          </form>
        </div>
      )}

      {tab === 'Biletat e mia' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tickets?.filter((t) => t.status !== 'CANCELLED').map((t) => (
            <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <Link to={`/events/${t.event.id}`} className="font-medium text-gray-800 hover:text-violet-600">
                {t.event.title}
              </Link>
              <p className="text-sm text-gray-500">{t.event.location}</p>
              <p className="text-sm text-gray-500 mt-1">{TICKET_STATUS_LABEL[t.status]}</p>
              <div className="mt-3">
                <TicketQR ticketId={t.id} />
              </div>
              <button
                onClick={() => cancelTicket.mutate(t.event.id)}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Anulo RSVP
              </button>
            </div>
          ))}
          {tickets?.filter((t) => t.status !== 'CANCELLED').length === 0 && (
            <p className="text-gray-400">Ende s'ke bileta.</p>
          )}
        </div>
      )}

      {tab === 'Duke ndjekur' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {following?.map((org) => (
            <div key={org.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <Link to={`/organizers/${org.id}`} className="font-medium text-gray-800 hover:text-violet-600">
                {org.name}
              </Link>
              <button onClick={() => unfollow.mutate(org.id)} className="text-sm text-red-600 hover:underline">
                Le se ndjekur
              </button>
            </div>
          ))}
          {following?.length === 0 && <p className="text-gray-400">S'ndjek asnje organizator.</p>}
        </div>
      )}

      {tab === 'Njoftimet' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm text-gray-500">
              {notifData?.unreadCount || 0} te palexuara
            </span>
            <button
              onClick={() => markAllRead.mutate()}
              className="text-sm text-violet-600 hover:underline"
            >
              Shenoji te gjitha si te lexuara
            </button>
          </div>
          <div>
            {notifData?.notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${
                  n.read ? 'text-gray-400' : 'text-gray-800 bg-violet-50/50'
                }`}
              >
                <span className="text-sm">{n.message}</span>
                {!n.read && (
                  <button
                    onClick={() => markRead.mutate(n.id)}
                    className="text-xs text-violet-600 hover:underline whitespace-nowrap ml-2"
                  >
                    Shenoje si te lexuar
                  </button>
                )}
              </div>
            ))}
            {notifData?.notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-gray-400">Ende pa njoftime.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
