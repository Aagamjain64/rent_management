import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';

export default function Layout({ children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">{t('appName')}</div>
        <button
          type="button"
          className="hamburger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
        <div className={`menu${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        <nav className="nav-links">
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin">{t('dashboard')}</NavLink>
              <NavLink to="/admin/owners">{t('owners')}</NavLink>
              <NavLink to="/admin/tenants">{t('tenants')}</NavLink>
              <NavLink to="/admin/pins">{t('pinReset')}</NavLink>
            </>
          )}
          {user?.role === 'owner' && <NavLink to="/owner">{t('dashboard')}</NavLink>}
          {user?.role === 'tenant' && <NavLink to="/tenant">{t('dashboard')}</NavLink>}
          <NavLink to="/change-pin">{t('changePin')}</NavLink>
        </nav>
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          <LanguageToggle />
          <button className="btn secondary" onClick={onLogout}>
            {t('logout')}
          </button>
        </div>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
