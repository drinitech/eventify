import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrganizerProfile, useMyFollowing, useFollowOrganizer, useUnfollowOrganizer } from '../hooks/useOrganizers';
import { EventCard } from '../components/EventCard';

export function OrganizerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading } = useOrganizerProfile(id);
  const { data: followingList } = useMyFollowing(!!user);
  const follow = useFollowOrganizer(id);
  const unfollow = useUnfollowOrganizer(id);

  if (isLoading) return <p className="text-gray-500">Duke ngarkuar...</p>;
  if (!data) return <p className="text-red-600">Organizatori nuk u gjet.</p>;

  const { organizer, followersCount, events } = data;
  const isFollowing = followingList?.some((o) => o.id === id);
  const isSelf = user?.id === id;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
          {organizer.avatarUrl ? (
            <img src={organizer.avatarUrl} alt={organizer.name} className="w-full h-full object-cover" />
          ) : (
            organizer.name[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{organizer.name}</h1>
          {organizer.bio && <p className="text-sm text-gray-500 mt-1">{organizer.bio}</p>}
          <p className="text-sm text-gray-400 mt-1">{followersCount} ndjekes</p>
        </div>
        {user && !isSelf && (
          <button
            onClick={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
            className="border border-violet-300 text-violet-600 hover:bg-violet-50 px-4 py-1.5 rounded-md text-sm"
          >
            {isFollowing ? 'Le se ndjekur' : 'Ndiq'}
          </button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Eventet e publikuara</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        {events.length === 0 && <p className="text-gray-400">Ende pa evente te publikuara.</p>}
      </div>
    </div>
  );
}
