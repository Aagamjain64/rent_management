import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { rupee } from '../components/MoneyCards';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const empty = { name: '', userId: '', pin: '', mobileNumber: '', roomNumber: '', monthlyRent: '', startDate: '', openingBalance: '' };
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    return api
      .get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function addTenant(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/owner/tenants', form);
      setForm(empty);
      setShow(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || t('error'));
    }
  }

  async function removeTn(tn) {
    if (!window.confirm(t('removeTenantConfirm', { name: tn.name }))) return;
    try {
      await api.delete(`/owner/tenants/${tn.tenantId}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  const fields = [
    ['name', 'name', 'text'],
    ['userId', 'userId', 'text'],
    ['pin', 'pin', 'password'],
    ['mobileNumber', 'mobile', 'text'],
    ['roomNumber', 'room', 'text'],
    ['monthlyRent', 'monthlyRent', 'number'],
    ['startDate', 'startDate', 'date'],
    ['openingBalance', 'openingBalance', 'number']
  ];

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p>{t('loading')}</p>;

  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('malik')}</h1>
        <button className="btn" onClick={() => setShow(!show)}>
          {show ? t('cancel') : t('addTenant')}
        </button>
      </div>
      {data.tenants.length > 0 && (
        <div className="stats" style={{ marginBottom: 14 }}>
          <div className="stat due">
            <small>{t('totalPending')}</small>
            <strong>{rupee(data.tenants.reduce((sum, x) => sum + (x.totalDue || 0), 0))}</strong>
          </div>
        </div>
      )}
      {show && (
        <div className="card">
          {formError && <div className="alert">{formError}</div>}
          <form className="form" onSubmit={addTenant}>
            {fields.map(([key, label, type]) => (
              <label key={key}>
                {t(label)}
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={['name', 'userId', 'pin', 'monthlyRent'].includes(key)}
                />
              </label>
            ))}
            <button className="btn">{t('addTenant')}</button>
          </form>
        </div>
      )}
      <div className="card">
        {data.tenants.length === 0 ? (
          <p className="muted">{t('noTenants')}</p>
        ) : (
          <>
            <div className="table-wrap desktop-only">
              <table>
                <thead>
                  <tr>
                    <th>{t('tenantLabel')}</th>
                    <th>{t('rent')}</th>
                    <th>{t('paid')}</th>
                    <th>{t('remaining')}</th>
                    <th>{t('previousDue')}</th>
                    <th>{t('lightBill')}</th>
                    <th>{t('totalDue')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.tenants.map((tn) => (
                    <tr key={tn.tenantId}>
                      <td>{tn.name}</td>
                      <td>{rupee(tn.monthlyRent)}</td>
                      <td>{rupee(tn.totalPaid)}</td>
                      <td>{rupee(tn.remainingMonth)}</td>
                      <td>{rupee(tn.previousDue)}</td>
                      <td>{rupee(tn.lightBill)}</td>
                      <td>{rupee(tn.totalDue)}</td>
                      <td>
                        <Link to={`/owner/tenants/${tn.tenantId}`}>{t('view')}</Link>{' '}
                        <button className="btn warn" onClick={() => removeTn(tn)}>
                          {t('remove')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tenant-cards mobile-only" style={{ marginTop: 16 }}>
              {data.tenants.map((tn) => (
                <Link key={`c-${tn.tenantId}`} to={`/owner/tenants/${tn.tenantId}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <strong>{tn.name}</strong>
                  <div className="muted">
                    {t('room')}: {tn.roomNumber || '—'}
                  </div>
                  <div>
                    {t('paid')} {rupee(tn.totalPaid)} · {t('remaining')} {rupee(tn.remainingMonth)} · {t('previousDue')} {rupee(tn.previousDue)} · {t('lightBill')}{' '}
                    {rupee(tn.lightBill)} · {t('totalDue')} {rupee(tn.totalDue)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
