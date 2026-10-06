'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function OutForDeliveryParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="out_for_delivery"
      title="Out for Delivery Queue"
      subtitle="Parcels currently out for doorstep final delivery by village agents and runners"
    />
  );
}
