import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import LanguageToggle from '../components/LanguageToggle';

export default function ForgotPin() {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/forgot-pin', { userId });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>{t('forgotPin')}</h1>
          <LanguageToggle />
        </div>
        {done ? (
          <div className="success">{t('resetSent')}</div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            {error && <div className="alert">{error}</div>}
            <label>
              {t('userId')}
              <input value={userId} onChange={(e) => setUserId(e.target.value)} required />
            </label>
            <button className="btn" type="submit">
              {t('requestReset')}
            </button>
          </form>
        )}
        <p>
          <Link to="/login">{t('back')}</Link>
        </p>
      </div>
    </div>
  );
}
