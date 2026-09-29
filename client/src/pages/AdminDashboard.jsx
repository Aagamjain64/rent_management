import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { rupee } from '../components/MoneyCards';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/payments')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p>{t('loading')}</p>;

  return (
    <>
      <h1>{t('basicPayments')}</h1>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('tenantLabel')}</th>
                <th>{t('owner')}</th>
                <th>{t('room')}</th>
                <th>{t('rent')}</th>
                <th>{t('paid')}</th>
                <th>{t('remaining')}</th>
                <th>{t('previousDue')}</th>
                <th>{t('lightBill')}</th>
                <th>{t('totalDue')}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.tenantId}>
                  <td>{row.tenantName}</td>
                  <td>{row.ownerName}</td>
                  <td>{row.roomNumber || '—'}</td>
                  <td>{rupee(row.monthlyRent)}</td>
                  <td>{rupee(row.totalPaid)}</td>
                  <td>{rupee(row.remainingMonth)}</td>
                  <td>{rupee(row.previousDue)}</td>
                  <td>{rupee(row.lightBill)}</td>
                  <td>{rupee(row.totalDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
