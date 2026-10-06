'use client';

import React from 'react';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function AtVillageAgentParcelsPage() {
  return (
    <ParcelTable
      fixedStatus="at_agent"
      title="At Village Agent Hubs"
      subtitle="Parcels received by village agents and waiting for customer pickup or local doorstep delivery"
    />
  );
}
