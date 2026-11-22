const { test } = require('node:test');
const assert = require('node:assert/strict');

const pricing = require('../lib/pricing');
const invoice = require('../lib/invoice');
const reports = require('../lib/reports');

function makeOrder(items, coupon) {
  const totals = pricing.computeTotals(items, coupon);
  return {
    id: 1,
    date: '01/01/2026',
    customer: 'In-memory customer',
    status: 'completed',
    coupon: coupon || '',
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total
  };
}

test('invoice matches billed GST breakdown and total', function () {
  const order = makeOrder([
    { id: 4, sku: 'RICE-3', name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ]);

  const invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.tax, order.tax);
  assert.equal(invoiceFigures.cgst + invoiceFigures.sgst, order.tax);
  assert.equal(invoiceFigures.total, order.total);
});

test('invoice applies the billed HSN slab to GST and total', function () {
  const order = makeOrder([
    { id: 1, sku: 'RICE-1', name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ]);

  const invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(order.tax, 5);
  assert.equal(order.total, 105);
  assert.equal(invoiceFigures.rows[0].gstPercent, 5);
  assert.equal(invoiceFigures.tax, 5);
  assert.equal(invoiceFigures.cgst, 2.5);
  assert.equal(invoiceFigures.sgst, 2.5);
  assert.equal(invoiceFigures.total, 105);
});

test('invoice uses the billed SAVE10 cap and calculates GST after discount', function () {
  const order = makeOrder([
    { id: 2, sku: 'TEA-1', name: 'Tea', hsn: '0902', price: 2000, qty: 1 }
  ], 'SAVE10');

  const invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(order.discount, 150);
  assert.equal(order.tax, 333);
  assert.equal(order.total, 2183);
  assert.equal(invoiceFigures.discount, 150);
  assert.equal(invoiceFigures.tax, 333);
  assert.equal(invoiceFigures.total, 2183);
  assert.equal(invoiceFigures.rows[0].gstPercent, 18);
});

test('GST reconciliation reports matching invoice and billed figures', function () {
  const order = makeOrder([
    { id: 3, sku: 'RICE-2', name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ]);

  const reconciliation = reports.getGstReconciliation({
    orders: [order],
    products: [],
    customers: []
  });

  assert.equal(reconciliation.totalChecked, 1);
  assert.equal(reconciliation.mismatchCount, 0);
  assert.equal(reconciliation.rows[0].ledgerTax, 5);
  assert.equal(reconciliation.rows[0].invoiceTax, 5);
  assert.equal(reconciliation.rows[0].ledgerTotal, 105);
  assert.equal(reconciliation.rows[0].invoiceTotal, 105);
  assert.equal(reconciliation.rows[0].delta, 0);
  assert.equal(reconciliation.totalDelta, 0);
});
