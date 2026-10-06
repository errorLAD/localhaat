'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function ReturnedParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="returned"
      title="Returned Shipments (RTO)"
      subtitle="Parcels reversed back to original seller or dispatch warehouse"
    />
  );
}
