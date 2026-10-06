'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function PickupPendingParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="pickup_pending"
      title="Pickup Pending Shipments"
      subtitle="Parcels at sender origin awaiting transporter arrival and pickup code verification"
    />
  );
}
