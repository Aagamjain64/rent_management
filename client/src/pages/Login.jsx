import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('tenant');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(userId, pin, role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/tenant');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'ROLE_MISMATCH' ? t('roleMismatch') : msg || t('invalidLogin'));
    }
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{t('appName')}</h1>
          <LanguageToggle />
        </div>
        <p className="muted">{t('demoHint')}</p>
        {error && <div className="alert">{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div>
            <strong>{t('iAmA')}</strong>
            <div className="role-pick" style={{ marginTop: 6 }}>
              {['tenant', 'owner'].map((r) => (
                <button type="button" key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>
                  {t(r)}
                </button>
              ))}
            </div>
          </div>
          <label>
            {t('userId')}
            <input value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </label>
          <label>
            {t('pin')}
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} required />
          </label>
          <button className="btn" type="submit">
            {t('login')}
          </button>
        </form>
        <p>
          <Link to="/forgot-pin">{t('forgotPin')}</Link>
        </p>
      </div>
    </div>
  );
}
