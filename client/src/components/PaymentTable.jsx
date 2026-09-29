import { rupee } from './MoneyCards';

export default function PaymentTable({ payments, t }) {
  if (!payments?.length) return <p className="muted">{t('noPayments')}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t('date')}</th>
            <th>{t('amount')}</th>
            <th>{t('paymentType')}</th>
            <th>{t('paymentMethod')}</th>
            <th>{t('notes')}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
              <td>{rupee(p.amount)}</td>
              <td>{p.paymentType === 'rent' ? t('rentType') : t('electricityType')}</td>
              <td>{t(p.paymentMethod)}</td>
              <td>{p.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
