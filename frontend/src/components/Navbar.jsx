import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data } = useNotifications(!!user);
  const unreadCount = data?.unreadCount || 0;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-violet-600">
          Eventify
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-600 hover:text-violet-600">
            Eventet
          </Link>

          {user && (
            <Link to="/events/new" className="text-gray-600 hover:text-violet-600">
              Krijo Event
            </Link>
          )}

          {user && (
            <Link to="/dashboard" className="text-gray-600 hover:text-violet-600">
              Dashboard
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-gray-600 hover:text-violet-600">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                className="relative text-gray-600 hover:text-violet-600"
              >
                Profili
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
              >
                Dilni
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-violet-600">
                Hyr
              </Link>
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-md"
              >
                Regjistrohu
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
