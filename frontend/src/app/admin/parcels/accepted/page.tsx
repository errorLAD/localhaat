'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function AcceptedParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="accepted"
      title="Partner Accepted Shipments"
      subtitle="Parcels accepted by logistics partners and scheduled for pickup dispatch"
    />
  );
}
