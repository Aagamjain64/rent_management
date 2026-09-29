import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPin from './pages/ForgotPin';
import ChangePin from './pages/ChangePin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOwners from './pages/AdminOwners';
import AdminTenants from './pages/AdminTenants';
import AdminPins from './pages/AdminPins';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerTenant from './pages/OwnerTenant';
import TenantDashboard from './pages/TenantDashboard';

function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return <p style={{ padding: 20 }}>...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/tenant" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-pin" element={<ForgotPin />} />
      <Route
        path="/change-pin"
        element={
          <ProtectedRoute>
            <ChangePin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/owners"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminOwners />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminTenants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pins"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminPins />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/tenants/:id"
        element={
          <ProtectedRoute roles={['owner']}>
            <OwnerTenant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant"
        element={
          <ProtectedRoute roles={['tenant']}>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
