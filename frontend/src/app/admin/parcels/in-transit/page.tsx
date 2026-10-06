'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function InTransitParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="in_transit"
      title="In-Transit Corridor Shipments"
      subtitle="Active shipments travelling along national and regional corridors towards village hubs"
    />
  );
}
