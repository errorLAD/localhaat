'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function CancelledParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="cancelled"
      title="Cancelled Shipments"
      subtitle="Parcels cancelled by sender or platform administrators with refund tracking"
    />
  );
}
