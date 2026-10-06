'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function SearchingParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="searching"
      title="Searching Partner Queue"
      subtitle="Parcels actively broadcasting to travelling logistics partners along corridor routes"
    />
  );
}
