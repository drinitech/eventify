import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvent } from '../hooks/useEvents';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments';
import { useMyTickets, useRsvp, useCancelRsvp } from '../hooks/useTickets';
import { useOrganizerProfile, useMyFollowing, useFollowOrganizer, useUnfollowOrganizer } from '../hooks/useOrganizers';
import { MapView } from '../components/MapView';
import { TicketQR } from '../components/TicketQR';

const dateFormatter = new Intl.DateTimeFormat('sq-AL', { dateStyle: 'full', timeStyle: 'short' });

const TICKET_STATUS_LABEL = {
  RESERVED: 'Rezervuar (pritet konfirmim pagese)',
  PAID: 'Konfirmuar',
  CHECKED_IN: 'Check-in i kryer',
};

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading, isError } = useEvent(id);
  const { data: commentsData } = useComments(id);
  const { data: myTickets } = useMyTickets();
  const rsvp = useRsvp(id);
  const cancelRsvp = useCancelRsvp(id);
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);

  const [reviewForm, setReviewForm] = useState({ text: '', rating: 5 });
  const [actionError, setActionError] = useState('');

  const { data: followingList } = useMyFollowing(!!user);
  const follow = useFollowOrganizer(event?.organizerId);
  const unfollow = useUnfollowOrganizer(event?.organizerId);

  if (isLoading) return <p className="text-gray-500">Duke ngarkuar...</p>;
  if (isError || !event) return <p className="text-red-600">Eventi nuk u gjet.</p>;

  const price = Number(event.price);
  const isOrganizer = user?.id === event.organizerId;
  const myTicket = myTickets?.find((t) => t.eventId === event.id && t.status !== 'CANCELLED');
  const isFollowing = followingList?.some((o) => o.id === event.organizerId);
  const eventPassed = new Date(event.date) < new Date();

  async function handleRsvp() {
    setActionError('');
    try {
      const result = await rsvp.mutateAsync();
      if (result.requiresPayment) {
        setActionError('U regjistrove! Bileta jote eshte ne pritje te konfirmimit te pageses nga organizatori.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'RSVP deshtoi');
    }
  }

  async function handleCancelRsvp() {
    setActionError('');
    try {
      await cancelRsvp.mutateAsync();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Anulimi deshtoi');
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setActionError('');
    try {
      await createComment.mutateAsync(reviewForm);
      setReviewForm({ text: '', rating: 5 });
    } catch (err) {
      setActionError(err.response?.data?.error || 'Review-i deshtoi');
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alert('Linku u kopjua!');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                {event.category}
              </span>
              <button onClick={handleShare} className="text-xs text-gray-500 hover:text-violet-600 border border-gray-300 rounded-md px-2 py-1">
                Shpernda
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
            <p className="text-gray-500 mt-1">{dateFormatter.format(new Date(event.date))}</p>
            <p className="text-gray-500">{event.location}</p>
            {event.avgRating != null && (
              <p className="text-sm text-amber-500 mt-1">
                ★ {Number(event.avgRating).toFixed(1)} ({event.totalReviews} review)
              </p>
            )}
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {event.lat != null && event.lng != null && (
          <MapView events={[event]} center={[event.lat, event.lng]} height="300px" />
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Review-t {commentsData ? `(${commentsData.comments.length})` : ''}
          </h2>

          {user && myTicket && eventPassed && (
            <form onSubmit={handleReviewSubmit} className="mb-6 space-y-2">
              <textarea
                required
                placeholder="Shkruaj nje review..."
                value={reviewForm.text}
                onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} yje
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={createComment.isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-3 py-1.5 rounded-md disabled:opacity-50"
                >
                  Posto review
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {commentsData?.comments.map((c) => (
              <div key={c.id} className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{c.user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm">{'★'.repeat(c.rating)}</span>
                    {(c.userId === user?.id || isOrganizer) && (
                      <button
                        onClick={() => deleteComment.mutate(c.id)}
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        Fshij
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{c.text}</p>
              </div>
            ))}
            {commentsData?.comments.length === 0 && (
              <p className="text-sm text-gray-400">Ende pa review-e.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {price === 0 ? 'Falas' : `€${price.toFixed(2)}`}
          </h2>

          {actionError && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
              {actionError}
            </p>
          )}

          {isOrganizer ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Ky eshte eventi yt.</p>
              <Link
                to={`/events/${event.id}/edit`}
                className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md text-sm"
              >
                Edito
              </Link>
              <Link
                to="/dashboard"
                className="block text-center bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md text-sm"
              >
                Shiko Dashboard
              </Link>
            </div>
          ) : !user ? (
            <button
              onClick={() => navigate('/login', { state: { from: `/events/${event.id}` } })}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md text-sm"
            >
              Hyr per te bere RSVP
            </button>
          ) : myTicket ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Statusi: <span className="font-medium">{TICKET_STATUS_LABEL[myTicket.status]}</span>
              </p>
              <TicketQR ticketId={myTicket.id} />
              <button
                onClick={handleCancelRsvp}
                disabled={cancelRsvp.isPending}
                className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-md text-sm disabled:opacity-50"
              >
                Anulo RSVP
              </button>
            </div>
          ) : eventPassed ? (
            <p className="text-sm text-gray-400">Eventi ka perfunduar.</p>
          ) : (
            <button
              onClick={handleRsvp}
              disabled={rsvp.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md text-sm disabled:opacity-50"
            >
              {price === 0 ? 'Konfirmo pjesemarrjen' : 'Rezervo biletën'}
            </button>
          )}
        </div>

        {event.organizer && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Organizatori</h2>
            <Link to={`/organizers/${event.organizerId}`} className="font-medium text-gray-800 hover:text-violet-600">
              {event.organizer.name}
            </Link>
            {event.organizer.bio && <p className="text-sm text-gray-500 mt-1">{event.organizer.bio}</p>}

            {user && !isOrganizer && (
              <button
                onClick={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
                className="mt-3 w-full border border-violet-300 text-violet-600 hover:bg-violet-50 py-1.5 rounded-md text-sm"
              >
                {isFollowing ? 'Le se ndjekur' : 'Ndiq organizatorin'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
