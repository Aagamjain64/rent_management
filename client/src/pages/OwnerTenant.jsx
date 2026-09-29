import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { downloadPdf } from '../services/api';
import MoneyCards, { rupee } from '../components/MoneyCards';
import PaymentTable from '../components/PaymentTable';

const emptyPayment = {
  amount: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentType: 'rent',
  paymentMethod: 'cash',
  notes: ''
};

export default function OwnerTenant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [payment, setPayment] = useState(emptyPayment);
  const [bill, setBill] = useState('');
  const [editId, setEditId] = useState('');
  const [details, setDetails] = useState({ roomNumber: '', monthlyRent: '', startDate: '', openingBalance: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(`/owner/tenants/${id}`);
    setData(res.data);
    setBill(String(res.data.summary.lightBill || ''));
    const x = res.data.tenant;
    setDetails({
      roomNumber: x.roomNumber || '',
      monthlyRent: x.monthlyRent || '',
      startDate: x.startDate ? String(x.startDate).slice(0, 10) : '',
      openingBalance: x.openingBalance || 0
    });
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || t('error')));
  }, [id, t]);

  async function savePayment(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api.put(`/owner/payments/${editId}`, payment);
        setEditId('');
      } else {
        await api.post(`/owner/tenants/${id}/payments`, payment);
      }
      setPayment(emptyPayment);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  async function removeTenant() {
    if (!window.confirm(t('removeTenantConfirm', { name: data.tenant.name }))) return;
    try {
      await api.delete(`/owner/tenants/${id}`);
      navigate('/owner');
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  async function saveDetails(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await api.put(`/owner/tenants/${id}`, details);
      await load();
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  async function saveBill(e) {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/owner/tenants/${id}/electricity`, { amount: Number(bill) });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    }
  }

  if (error && !data) return <div className="alert">{error}</div>;
  if (!data) return <p>{t('loading')}</p>;

  const tn = data.tenant;
  const s = data.summary;

  return (
    <>
      <p>
        <Link to="/owner">{t('back')}</Link>
      </p>
      <h1>{t('tenantDetails')}</h1>
      {error && <div className="alert">{error}</div>}
      <div className="card">
        <h2>{tn.name}</h2>
        <p>
          {t('mobile')}: {tn.mobileMasked}
        </p>
        <p>
          {t('room')}: {tn.roomNumber || '—'}
        </p>
        <p>
          {t('govId')}: {tn.governmentIdType ? t(tn.governmentIdType) : '—'}
        </p>
        <p>
          {t('idMasked')}: {tn.governmentIdMasked}
        </p>
        <p>
          {t('rent')}: {rupee(s.monthlyRent)}
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
        <h2>{t('editDetails')}</h2>
        {saved && <div className="success">{t('saved')}</div>}
        <form className="form" onSubmit={saveDetails}>
          <label>
            {t('room')}
            <input value={details.roomNumber} onChange={(e) => setDetails({ ...details, roomNumber: e.target.value })} />
          </label>
          <label>
            {t('monthlyRent')}
            <input type="number" value={details.monthlyRent} onChange={(e) => setDetails({ ...details, monthlyRent: e.target.value })} required />
          </label>
          <label>
            {t('startDate')}
            <input type="date" value={details.startDate} onChange={(e) => setDetails({ ...details, startDate: e.target.value })} />
          </label>
          <label>
            {t('openingBalance')}
            <input type="number" value={details.openingBalance} onChange={(e) => setDetails({ ...details, openingBalance: e.target.value })} />
          </label>
          <button className="btn">{t('save')}</button>
        </form>
        <p style={{ marginTop: 14 }}>
          <button type="button" className="btn warn" onClick={removeTenant}>
            {t('removeTenant')}
          </button>
        </p>
      </div>
      <div className="card">
        <h2>{t('addPayment')}</h2>
        <form className="form" onSubmit={savePayment}>
          <label>
            {t('amount')}
            <input type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} required />
          </label>
          <label>
            {t('date')}
            <input type="date" value={payment.paymentDate} onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })} required />
          </label>
          <label>
            {t('paymentType')}
            <select value={payment.paymentType} onChange={(e) => setPayment({ ...payment, paymentType: e.target.value })}>
              <option value="rent">{t('rentType')}</option>
              <option value="electricity">{t('electricityType')}</option>
            </select>
          </label>
          <label>
            {t('paymentMethod')}
            <select value={payment.paymentMethod} onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })}>
              <option value="cash">{t('cash')}</option>
              <option value="upi">{t('upi')}</option>
              <option value="bank_transfer">{t('bank_transfer')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </label>
          <label>
            {t('notes')}
            <input value={payment.notes} onChange={(e) => setPayment({ ...payment, notes: e.target.value })} />
          </label>
          <button className="btn">{editId ? t('updatePayment') : t('addPayment')}</button>
        </form>
      </div>
      <div className="card">
        <h2>{t('lightBill')}</h2>
        <form className="form" onSubmit={saveBill}>
          <label>
            {t('amount')}
            <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} required />
          </label>
          <button className="btn">{t('saveBill')}</button>
        </form>
      </div>
      <div className="card">
        <div className="row-actions" style={{ justifyContent: 'space-between' }}>
          <h2>{t('paymentHistory')}</h2>
          <button
            className="btn"
            onClick={() => downloadPdf(`/pdf/owner/tenants/${id}`, `rent-${tn.name}.pdf`)}
          >
            {t('downloadPdf')}
          </button>
        </div>
        <PaymentTable payments={data.payments} t={t} />
        {data.payments.map((p) => (
          <button
            key={`e-${p._id}`}
            className="btn ghost"
            style={{ marginRight: 8, marginTop: 8 }}
            onClick={() => {
              setEditId(p._id);
              setPayment({
                amount: p.amount,
                paymentDate: new Date(p.paymentDate).toISOString().slice(0, 10),
                paymentType: p.paymentType,
                paymentMethod: p.paymentMethod,
                notes: p.notes || ''
              });
            }}
          >
            {t('edit')} {rupee(p.amount)}
          </button>
        ))}
      </div>
    </>
  );
}
