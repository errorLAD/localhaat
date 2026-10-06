'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function AtHubParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="at_hub"
      title="At Hub / Sorting Facility"
      subtitle="Parcels currently staged at regional sorting hubs and cross-docking centers"
    />
  );
}
