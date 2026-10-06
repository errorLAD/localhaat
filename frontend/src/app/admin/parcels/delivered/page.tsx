'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function DeliveredParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="delivered"
      title="Delivered Parcels Archive"
      subtitle="Completed shipments with verified customer delivery PINs and distributed earnings"
    />
  );
}
