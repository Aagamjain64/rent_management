import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function AdminTenants() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ name: '', userId: '', pin: '', mobileNumber: '', ownerId: '', roomNumber: '', monthlyRent: '' });
  const [error, setError] = useState('');

  async function load() {
    const [tRes, oRes] = await Promise.all([api.get('/admin/tenants'), api.get('/admin/owners')]);
    setTenants(tRes.data.tenants);
    setOwners(oRes.data.owners);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  async function remove(tn) {
    if (!window.confirm(t('removeTenantConfirm', { name: tn.user?.name }))) return;
    setError('');
    try {
      await api.delete(`/admin/tenants/${tn._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/tenants', form);
      setForm({ name: '', userId: '', pin: '', mobileNumber: '', ownerId: form.ownerId, roomNumber: '', monthlyRent: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  return (
    <>
      <h1>{t('tenants')}</h1>
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
          <label>
            {t('room')}
            <input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
          </label>
          <label>
            {t('monthlyRent')}
            <input type="number" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} />
          </label>
          <label>
            {t('selectOwner')}
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} required>
              <option value=""></option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.userId})
                </option>
              ))}
            </select>
          </label>
          <button className="btn">{t('addTenant')}</button>
        </form>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('userId')}</th>
                <th>{t('owner')}</th>
                <th>{t('room')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tn) => (
                <tr key={tn._id}>
                  <td>{tn.user?.name}</td>
                  <td>{tn.user?.userId}</td>
                  <td>{tn.owner?.name}</td>
                  <td>{tn.roomNumber || '—'}</td>
                  <td>
                    <button className="btn warn" onClick={() => remove(tn)}>
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
