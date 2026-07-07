import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Duke ngarkuar...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
