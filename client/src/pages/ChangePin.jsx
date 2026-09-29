import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ChangePin() {
  const { t } = useTranslation();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!/^\d{4,6}$/.test(newPin)) {
      setError(t('pinFormat'));
      return;
    }
    if (newPin !== confirmPin) {
      setError(t('pinMismatch'));
      return;
    }
    try {
      await api.post('/auth/change-pin', { currentPin, newPin, confirmPin });
      setMsg(t('pinUpdated'));
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  return (
    <>
      <h1>{t('changePin')}</h1>
      <div className="card">
        {error && <div className="alert">{error}</div>}
        {msg && <div className="success">{msg}</div>}
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('currentPin')}
            <input type="password" value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} required />
          </label>
          <label>
            {t('newPin')}
            <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} required />
          </label>
          <label>
            {t('confirmPin')}
            <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} required />
          </label>
          <button className="btn">{t('save')}</button>
        </form>
      </div>
    </>
  );
}
