const PDFDocument = require('pdfkit');

function money(n) {
  return `Rs ${Number(n || 0).toLocaleString('en-IN')}`;
}

function monthName(month) {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ][month - 1];
}

function writeHistoryPdf(res, data) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=rent-history-${data.tenantName.replace(/\s+/g, '-')}.pdf`
  );
  doc.pipe(res);

  doc.fontSize(18).text('Rent Payment History', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toLocaleString('en-IN')}`, {
    align: 'center'
  });
  doc.moveDown();
  doc.fillColor('#000').fontSize(12);
  doc.text(`Tenant: ${data.tenantName}`);
  doc.text(`Owner: ${data.ownerName}`);
  doc.text(`Room: ${data.roomNumber || '—'}`);
  doc.text(`Period: ${monthName(data.month)} ${data.year}`);
  doc.moveDown();
  doc.text(`Monthly Rent: ${money(data.monthlyRent)}`);
  doc.text(`Electricity Bill: ${money(data.lightBill)}`);
  doc.text(`Electricity Paid: ${money(data.electricityPaid)}`);
  doc.text(`Total Paid: ${money(data.totalPaid)}`);
  doc.text(`Remaining Rent: ${money(data.remainingRent)}`);
  doc.text(`Remaining Electricity: ${money(data.remainingElectricity)}`);
  doc.text(`Previous Due (carried forward): ${money(data.previousDue)}`);
  doc.text(`Total Due: ${money(data.totalDue)}`);
  doc.moveDown();
  doc.fontSize(14).text('Payments');
  doc.moveDown(0.4);
  doc.fontSize(11);

  if (!data.payments.length) {
    doc.text('No payments recorded for this period.');
  } else {
    data.payments.forEach((p) => {
      const date = new Date(p.paymentDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.text(
        `${date}    ${money(p.amount)}    ${p.paymentType}    ${p.paymentMethod}${
          p.notes ? `    ${p.notes}` : ''
        }`
      );
    });
  }

  doc.end();
}

module.exports = { writeHistoryPdf };
