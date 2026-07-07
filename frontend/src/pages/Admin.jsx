import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useAdminStats,
  useAdminEvents,
  useModerateEvent,
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from '../hooks/useAdmin';

const TABS = ['Statistika', 'Eventet', 'Perdoruesit'];
const EVENT_STATUSES = ['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'CANCELLED'];
const ROLES = ['PARTICIPANT', 'ORGANIZER', 'BOTH', 'ADMIN'];

const dateFormatter = new Intl.DateTimeFormat('sq-AL', { dateStyle: 'medium' });

export function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);

  if (user.role !== 'ADMIN') {
    return <p className="text-red-600">Nuk ke qasje ne kete faqe.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>

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

      {tab === 'Statistika' && <StatsTab />}
      {tab === 'Eventet' && <EventsTab />}
      {tab === 'Perdoruesit' && <UsersTab currentUserId={user.id} />}
    </div>
  );
}

function StatsTab() {
  const { data: stats, isLoading } = useAdminStats();
  if (isLoading) return <p className="text-gray-500">Duke ngarkuar...</p>;

  const items = [
    ['Perdorues', stats.usersCount],
    ['Evente', stats.eventsCount],
    ['Komente', stats.commentsCount],
    ['Bileta te shitura', stats.ticketsSold],
    ['Te ardhura', `€${Number(stats.totalRevenue).toFixed(2)}`],
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

function EventsTab() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: events, isLoading } = useAdminEvents(statusFilter || undefined);
  const moderate = useModerateEvent();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Evente</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          <option value="">Te gjitha statuset</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="p-4 text-gray-500">Duke ngarkuar...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Titulli</th>
              <th className="px-4 py-2">Organizatori</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Statusi</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((ev) => (
              <tr key={ev.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{ev.title}</td>
                <td className="px-4 py-2 text-gray-500">{ev.organizer.name}</td>
                <td className="px-4 py-2 text-gray-500">{dateFormatter.format(new Date(ev.date))}</td>
                <td className="px-4 py-2">
                  <select
                    value={ev.status}
                    onChange={(e) => moderate.mutate({ id: ev.id, status: e.target.value })}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                  >
                    {EVENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {events?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  Asnje event.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersTab({ currentUserId }) {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  function handleDelete(id) {
    if (!confirm('Je i sigurt qe do ta fshish kete perdorues?')) return;
    deleteUser.mutate(id);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-700 px-4 py-3 border-b border-gray-200">Perdoruesit</h2>

      {isLoading ? (
        <p className="p-4 text-gray-500">Duke ngarkuar...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Emri</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Roli</th>
              <th className="px-4 py-2">Regjistruar</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 text-gray-500">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-gray-500">{dateFormatter.format(new Date(u.createdAt))}</td>
                <td className="px-4 py-2 text-right">
                  {u.id !== currentUserId && (
                    <button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 hover:underline">
                      Fshij
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
