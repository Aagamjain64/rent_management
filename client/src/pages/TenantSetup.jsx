import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function TenantSetup({ onDone }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    governmentIdType: 'aadhaar',
    governmentIdNumber: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tenant/profile').then((res) => {
      setForm((f) => ({
        ...f,
        fullName: res.data.name || '',
        mobileNumber: res.data.mobileNumber || ''
      }));
    });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tenant/profile', form);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  return (
    <>
      <h1>{t('myProfile')}</h1>
      <p className="muted">{t('completeProfile')} {t('rentSetByOwner')}</p>
      <div className="card">
        {error && <div className="alert">{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('fullName')}
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </label>
          <label>
            {t('mobile')}
            <input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} required />
          </label>
          <label>
            {t('govIdType')}
            <select
              value={form.governmentIdType}
              onChange={(e) => setForm({ ...form, governmentIdType: e.target.value })}
            >
              <option value="aadhaar">{t('aadhaar')}</option>
              <option value="pan">{t('pan')}</option>
              <option value="driving_licence">{t('driving_licence')}</option>
              <option value="voter_id">{t('voter_id')}</option>
              <option value="passport">{t('passport')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </label>
          <label>
            {t('govIdNumber')}
            <input
              value={form.governmentIdNumber}
              onChange={(e) => setForm({ ...form, governmentIdNumber: e.target.value })}
              required
            />
          </label>
          <button className="btn">{t('save')}</button>
        </form>
      </div>
    </>
  );
}
