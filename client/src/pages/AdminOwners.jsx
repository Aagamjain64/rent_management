import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function AdminOwners() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ name: '', userId: '', pin: '', mobileNumber: '' });
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/admin/owners');
    setOwners(res.data.owners);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  async function remove(o) {
    if (!window.confirm(t('removeConfirm', { name: o.name }))) return;
    setError('');
    try {
      await api.delete(`/admin/owners/${o.id}`);
      await load();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'OWNER_HAS_TENANTS' ? t('ownerHasTenants') : msg || t('error'));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/owners', form);
      setForm({ name: '', userId: '', pin: '', mobileNumber: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  return (
    <>
      <h1>{t('owners')}</h1>
      <div className="card">
        {error && <div className="alert">{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('name')}
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            {t('userId')}
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required />
          </label>
          <label>
            {t('pin')}
            <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} required />
          </label>
          <label>
            {t('mobile')}
            <input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} />
          </label>
          <button className="btn">{t('addOwner')}</button>
        </form>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('userId')}</th>
                <th>{t('mobile')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>{o.userId}</td>
                  <td>{o.mobileNumber || '—'}</td>
                  <td>
                    <button className="btn warn" onClick={() => remove(o)}>
                      {t('remove')}
                    </button>
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
