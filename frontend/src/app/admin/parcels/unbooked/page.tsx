'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function UnbookedParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="unbooked"
      title="New / Unbooked Parcels Dispatch Queue"
      subtitle="Customer shipments awaiting travelling logistics partner acceptance. Match and assign nearby transporters."
      isUnbookedQueue={true}
    />
  );
}
