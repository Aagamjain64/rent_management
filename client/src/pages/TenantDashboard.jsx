import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { downloadPdf } from '../services/api';
import MoneyCards, { rupee } from '../components/MoneyCards';
import PaymentTable from '../components/PaymentTable';
import TenantSetup from './TenantSetup';

export default function TenantDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    return api
      .get('/tenant/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || t('error')));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p>{t('loading')}</p>;
  if (!data.profileCompleted) return <TenantSetup onDone={load} />;

  const p = data.profile;
  const s = data.summary;

  return (
    <>
      <h1>{t('dashboard')}</h1>
      <div className="card">
        <h2>{t('myProfile')}</h2>
        <p>
          {t('name')}: {p.name}
        </p>
        <p>
          {t('mobile')}: {p.mobileMasked}
        </p>
        <p>
          {t('room')}: {p.roomNumber}
        </p>
        <p>
          {t('govId')}: {p.governmentIdType ? t(p.governmentIdType) : '—'}
        </p>
        <p>
          {t('idMasked')}: {p.governmentIdMasked}
        </p>
      </div>
      <h2>{t('currentMonth')}</h2>
      <div className="card">
        <p>
          {t('rent')}: {rupee(s.monthlyRent)}
        </p>
        <p>
          {t('paidMonth')}: {rupee(s.totalPaid)}
        </p>
        <p>
          {t('remainingMonth')}: {rupee(s.remainingMonth)}
        </p>
        <p>
          {t('previousDue')}: {rupee(s.previousDue)}
        </p>
        <p>
          {t('lightBill')}: {rupee(s.lightBill)}
        </p>
        <p>
          <strong>
            {t('totalDue')}: {rupee(s.totalDue)}
          </strong>
        </p>
      </div>
      <MoneyCards
        s={s}
        labels={{
          paid: t('paidMonth'),
          remaining: t('remainingMonth'),
          lightBill: t('lightBill'),
          totalDue: t('totalDue'),
          previousDue: t('previousDue'),
          rent: t('rent'),
          light: t('lightBill'),
          paidShort: t('paid'),
          remainingShort: t('remaining')
        }}
      />
      <div className="card">
        <div className="row-actions" style={{ justifyContent: 'space-between' }}>
          <h2>{t('paymentHistory')}</h2>
          <button className="btn" onClick={() => downloadPdf('/pdf/tenant', `rent-${p.name}.pdf`)}>
            {t('downloadPdf')}
          </button>
        </div>
        <PaymentTable payments={data.payments} t={t} />
      </div>
    </>
  );
}
