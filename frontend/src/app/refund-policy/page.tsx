'use client';

import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-primary-800">CUSTOMER SAFEGUARDS</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Cancellation & Refund Policy</h1>
          <p className="text-xs text-gray-500 mt-1">Operated by InfraBlue Material Technologies Private Limited • localhaat.in</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Marketplace Order Cancellations</h2>
          <p>
            Customers may cancel a marketplace order prior to seller dispatch without incurring penalties. Once a package is packed and handed over to a transporter or travelling partner, cancellation is subject to return transit logistics fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Parcel Booking Cancellations</h2>
          <p>
            Consignors may cancel an unassigned parcel booking free of charge. If a travelling or logistics partner has already arrived at the pickup location and verified the dispatch, standard pickup cancellation charges may apply.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Failed Deliveries & Non-Collection</h2>
          <p>
            If a parcel cannot be delivered because the recipient is unreachable or fails to provide the 4-digit PIN at the village hub within the designated retention period, the parcel will be safely returned to the sender.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Refund Processing</h2>
          <p>
            Approved refunds are credited to the original payment source or user wallet within 5–7 business days. For assistance, reach out to <Link href="/contact" className="text-primary-700 underline font-bold">LocalHaat Support</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
