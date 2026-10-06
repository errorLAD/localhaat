'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function PickedUpParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="picked_up"
      title="Picked Up Shipments"
      subtitle="Parcels successfully collected from sellers and verified via pickup codes"
    />
  );
}
