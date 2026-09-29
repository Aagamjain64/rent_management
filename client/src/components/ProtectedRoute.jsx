import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p style={{ padding: 20 }}>...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/tenant';
    return <Navigate to={home} replace />;
  }
  return <Layout>{children}</Layout>;
}
