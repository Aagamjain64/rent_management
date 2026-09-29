export function rupee(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

// paid / remaining: is mahine ke (rent + light bill) dono ka total
export default function MoneyCards({ s, labels }) {
  return (
    <div className="stats">
      <div className="stat paid">
        <small>{labels.paid}</small>
        <strong>{rupee(s.totalPaid)}</strong>
        <em>
          {labels.rent} {rupee(s.rentPaid)} · {labels.light} {rupee(s.electricityPaid)}
        </em>
      </div>
      <div className="stat remain">
        <small>{labels.remaining}</small>
        <strong>{rupee(s.remainingMonth)}</strong>
        <em>
          {labels.rent} {rupee(s.remainingRent)} · {labels.light} {rupee(s.remainingElectricity)}
        </em>
      </div>
      <div className="stat prev">
        <small>{labels.previousDue}</small>
        <strong>{rupee(s.previousDue)}</strong>
      </div>
      <div className="stat bill">
        <small>{labels.lightBill}</small>
        <strong>{rupee(s.remainingElectricity)}</strong>
        <em>
          {labels.billShort} {rupee(s.lightBill)} − {labels.paidShort} {rupee(s.electricityPaid)}
        </em>
      </div>
      <div className="stat due">
        <small>{labels.totalDue}</small>
        <strong>{rupee(s.totalDue)}</strong>
      </div>
    </div>
  );
}
