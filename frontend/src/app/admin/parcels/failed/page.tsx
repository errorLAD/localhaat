'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function FailedParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="failed"
      title="Failed Delivery Attempts"
      subtitle="Parcels where doorstep delivery could not be completed. Reschedule or initiate returns."
    />
  );
}
