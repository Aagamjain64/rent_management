import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function AdminPins() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ userId: '', newPin: '', confirmPin: '', requestId: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await api.get('/admin/pin-requests');
    setRequests(res.data.requests);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api.post('/admin/reset-pin', form);
      setMsg(t('pinUpdated'));
      setForm({ userId: '', newPin: '', confirmPin: '', requestId: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  async function reject(id) {
    await api.post(`/admin/pin-requests/${id}/reject`);
    await load();
  }

  return (
    <>
      <h1>{t('pinReset')}</h1>
      <div className="card">
        {error && <div className="alert">{error}</div>}
        {msg && <div className="success">{msg}</div>}
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('userId')}
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required />
          </label>
          <label>
            {t('newPin')}
            <input value={form.newPin} onChange={(e) => setForm({ ...form, newPin: e.target.value })} required />
          </label>
          <label>
            {t('confirmPin')}
            <input value={form.confirmPin} onChange={(e) => setForm({ ...form, confirmPin: e.target.value })} required />
          </label>
          <button className="btn">{t('resetPin')}</button>
        </form>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('userId')}</th>
                <th>{t('name')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId}</td>
                  <td>{r.user?.name}</td>
                  <td>{t(r.status)}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="row-actions">
                        <button
                          className="btn"
                          onClick={() => setForm({ ...form, userId: r.userId, requestId: r._id })}
                        >
                          {t('resetPin')}
                        </button>
                        <button className="btn secondary" onClick={() => reject(r._id)}>
                          {t('reject')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
