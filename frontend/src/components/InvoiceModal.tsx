'use client';

import React from 'react';
import {
  X,
  Printer,
  Download,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency, formatDate } from '../lib/utils';

export interface InvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export function printOrderInvoice(order: any, customer?: any) {
  if (!order) return;

  const items = (order.items || []).map((it: any) => ({
    title: it.productTitle || it.productId?.title || 'LocalHaat Grocery Item',
    sku: it.productId?.sku || it.sku || `LH-${(it.productTitle || 'PROD').slice(0, 4).toUpperCase()}`,
    unit: it.unit || it.productId?.unit || '1 unit',
    qty: it.quantity || 1,
    unitPrice: it.unitPrice || it.productId?.price || 0,
    subtotal: it.subtotal || (it.unitPrice || it.productId?.price || 0) * (it.quantity || 1),
  }));

  const customerName =
    order.customerId?.name || customer?.name || order.deliveryAddress?.contactPerson || 'Customer';
  const customerPhone =
    order.customerId?.phone || customer?.phone || order.deliveryAddress?.contactPhone || '9999900005';
  const deliveryPin = order.deliveryPin || order.parcelId?.deliveryPin || '4826';
  const orderNumber = order.orderNumber || 'LH-ORD-70192';
  const dateStr = formatDate(order.createdAt || order.placedAt || new Date());
  const paymentMethod = (order.paymentMethod || 'cod').toUpperCase() === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online';
  const paymentStatus = (order.paymentStatus || 'pending').toUpperCase();

  const printWindow = window.open('', '_blank', 'width=900,height=950');
  if (!printWindow) {
    alert('Please allow popups to view and download the invoice PDF.');
    return;
  }

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice_${orderNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 40px;
          line-height: 1.5;
          font-size: 13px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none !important; }
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-top: 4px;
        }
        .inv-meta {
          text-align: right;
        }
        .inv-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          background: #0f172a;
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .meta-line {
          font-size: 12px;
          color: #475569;
        }
        .meta-line strong {
          color: #0f172a;
        }
        /* DELIVERY PIN BANNER */
        .pin-container {
          background: #fef3c7;
          border: 2px dashed #d97706;
          border-radius: 12px;
          padding: 18px 24px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pin-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #92400e;
        }
        .pin-value {
          font-size: 32px;
          font-weight: 900;
          font-family: monospace;
          letter-spacing: 6px;
          color: #78350f;
          background: #ffffff;
          padding: 4px 18px;
          border-radius: 8px;
          border: 1px solid #f59e0b;
        }
        .pin-desc {
          font-size: 11px;
          color: #b45309;
          margin-top: 4px;
        }
        /* ADDRESS GRID */
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .address-box h4 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .address-box p {
          font-size: 13px;
          color: #1e293b;
          line-height: 1.4;
        }
        /* ITEMS TABLE */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #f1f5f9;
          color: #0f172a;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 12px 14px;
          text-align: left;
          border-bottom: 2px solid #cbd5e1;
        }
        td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        /* TOTALS */
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }
        .totals-table {
          width: 320px;
        }
        .totals-table tr td {
          padding: 6px 12px;
          border: none;
        }
        .grand-total {
          border-top: 2px solid #0f172a !important;
          border-bottom: 2px solid #0f172a !important;
          font-weight: 900;
          font-size: 16px;
          color: #0f172a;
        }
        /* FOOTER */
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 11px;
        }
        .print-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

      <div class="header">
        <div>
          <div class="brand-title">🌾 LocalHaat</div>
          <div class="brand-sub">Commerce & Logistics Network</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
            GT Road Central Haat Depot, Varanasi, UP - 221001<br>
            GSTIN: 09AAECR1234F1Z5 | support@localhaat.in
          </div>
        </div>
        <div class="inv-meta">
          <div class="inv-badge">Tax Invoice</div>
          <div class="meta-line">Invoice #: <strong>INV-${orderNumber}</strong></div>
          <div class="meta-line">Order ID: <strong>#${orderNumber}</strong></div>
          <div class="meta-line">Date: <strong>${dateStr}</strong></div>
          <div class="meta-line">Status: <strong style="color: #059669;">${order.orderStatus?.toUpperCase() || 'CONFIRMED'}</strong></div>
        </div>
      </div>

      <!-- DELIVERY PIN MANIFEST HIGHLIGHT -->
      <div class="pin-container">
        <div>
          <div class="pin-label">🔑 4-Digit Delivery Verification PIN</div>
          <div class="pin-desc">
            Present this secret code to the LocalHaat logistics agent at your doorstep upon package inspection.
          </div>
        </div>
        <div class="pin-value">${deliveryPin}</div>
      </div>

      <!-- ADDRESS & LOGISTICS INFO -->
      <div class="address-grid">
        <div class="address-box">
          <h4>Billed & Shipped To:</h4>
          <p>
            <strong>${customerName}</strong><br>
            Phone: ${customerPhone}<br>
            ${order.deliveryAddress?.addressLine || 'Address on record'}<br>
            ${order.deliveryAddress?.villageOrCity || 'Central Hub'}, ${order.deliveryAddress?.district || 'Varanasi'}<br>
            ${order.deliveryAddress?.state || 'Uttar Pradesh'} - ${order.deliveryAddress?.pincode || '221008'}
          </p>
        </div>
        <div class="address-box">
          <h4>Payment & Fulfillment Details:</h4>
          <p>
            Payment Mode: <strong>${paymentMethod}</strong><br>
            Payment Status: <strong>${paymentStatus}</strong><br>
            Fulfillment: <strong>Direct LocalHaat Company Warehouse</strong><br>
            Consignment Tracking: <strong>${order.parcelId?.parcelTrackingNumber || order.orderNumber}</strong>
          </p>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Item Description</th>
            <th>SKU</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (it: any, index: number) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${it.title}</strong></td>
              <td style="color: #64748b; font-family: monospace;">${it.sku}</td>
              <td class="text-center">${it.qty}</td>
              <td class="text-right">₹${Number(it.unitPrice).toLocaleString()}</td>
              <td class="text-right"><strong>₹${Number(it.subtotal).toLocaleString()}</strong></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- TOTALS -->
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Items Subtotal:</td>
            <td class="text-right">₹${Number(order.subtotal || order.totalAmount - (order.deliveryFee || 40)).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Delivery & Hub Handling:</td>
            <td class="text-right">₹${Number(order.deliveryFee !== undefined ? order.deliveryFee : 40).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Applicable Taxes (GST 5% incl.):</td>
            <td class="text-right">₹${Math.round((order.totalAmount || 0) * 0.05).toLocaleString()}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td class="text-right">₹${Number(order.totalAmount || 0).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div>
          This is an electronically generated valid tax invoice issued under LocalHaat Rural Commerce engine.
        </div>
        <div>
          Authorized Signatory: <strong>Gokul (Store Admin)</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

export default function InvoiceModal({ order, isOpen, onClose, customer }: InvoiceModalProps) {
  const [copiedPin, setCopiedPin] = React.useState(false);

  if (!isOpen || !order) return null;

  const deliveryPin = order.deliveryPin || order.parcelId?.deliveryPin || '4826';
  const orderNumber = order.orderNumber || 'LH-ORD-70192';

  const copyPin = () => {
    navigator.clipboard.writeText(deliveryPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handlePrint = () => {
    printOrderInvoice(order, customer);
  };

  const items = order.items || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Modal Controls */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Tax Invoice & Delivery Receipt</h3>
              <p className="text-[11px] text-slate-400 font-mono">#{orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Invoice Content Sheet */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Company & Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-emerald-700">🌾</span> LocalHaat Direct Store
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Single-Vendor Rural & Semi-Urban Commerce Engine
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Central Warehouse, GT Road, Varanasi, UP - 221001<br />
                GSTIN: 09AAECR1234F1Z5 | support@localhaat.in
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black tracking-wider uppercase">
                Official Tax Invoice
              </span>
              <p className="text-xs text-slate-600">
                Invoice: <strong className="font-mono text-slate-900">INV-{orderNumber}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Date: <strong className="text-slate-900">{formatDate(order.createdAt || order.placedAt || new Date())}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Status:{' '}
                <strong className="text-emerald-700 uppercase font-black">
                  {order.orderStatus || 'CONFIRMED'}
                </strong>
              </p>
            </div>
          </div>

          {/* 🔑 HIGHLIGHTED 4-DIGIT DELIVERY PIN CONTAINER */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  4-Digit Security Delivery PIN
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-snug">
                Provide this verification PIN to the LocalHaat delivery agent only upon receiving and inspecting your package.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="font-mono text-3xl font-black tracking-widest text-slate-950 bg-white px-5 py-2 rounded-xl border border-amber-300 shadow-2xs">
                {deliveryPin}
              </div>
              <button
                type="button"
                onClick={copyPin}
                title="Copy PIN"
                className="p-2.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 transition-colors cursor-pointer"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {order.customerId?.name || customer?.name || 'Priya Sharma'}
              </p>
              <p className="text-slate-600 mt-0.5">
                Phone: {order.customerId?.phone || customer?.phone || '9999900005'}
              </p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {order.deliveryAddress?.addressLine || 'Address on record'}<br />
                {order.deliveryAddress?.villageOrCity || 'Central Hub'},{' '}
                {order.deliveryAddress?.district || 'Varanasi'},{' '}
                {order.deliveryAddress?.state || 'Uttar Pradesh'} -{' '}
                {order.deliveryAddress?.pincode || '221008'}
              </p>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Payment & Consignment:
              </span>
              <div className="space-y-1">
                <p className="text-slate-700">
                  Payment Method:{' '}
                  <strong className="text-slate-900">
                    {(order.paymentMethod || 'cod').toUpperCase() === 'COD'
                      ? 'Cash on Delivery (COD)'
                      : 'Prepaid Online'}
                  </strong>
                </p>
                <p className="text-slate-700">
                  Payment Status:{' '}
                  <strong className="text-emerald-700 uppercase">
                    {order.paymentStatus || 'Pending'}
                  </strong>
                </p>
                <p className="text-slate-700">
                  Tracking Code:{' '}
                  <strong className="font-mono text-slate-900">
                    {order.parcelId?.parcelTrackingNumber || order.orderNumber}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-left">#</th>
                  <th className="py-2.5 px-3 text-left">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      Standard Company Store Order Fulfillment
                    </td>
                  </tr>
                ) : (
                  items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">
                          {item.productTitle || item.productId?.title || 'LocalHaat Product'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.productId?.sku || `LH-${Date.now().toString().slice(-4)}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {item.quantity || 1}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatCurrency(item.unitPrice || item.productId?.price || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(
                          item.subtotal ||
                            (item.unitPrice || item.productId?.price || 0) * (item.quantity || 1)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(
                    order.subtotal ||
                      order.totalAmount - (order.deliveryFee !== undefined ? order.deliveryFee : 40)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery & Hub Fee:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(order.deliveryFee !== undefined ? order.deliveryFee : 40)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (5%):</span>
                <span className="font-mono text-slate-600">
                  {formatCurrency(Math.round((order.totalAmount || 0) * 0.05))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Keep this invoice for warranty and order delivery verification.
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={onClose} variant="outline" size="sm" className="rounded-xl text-xs">
              Close
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
