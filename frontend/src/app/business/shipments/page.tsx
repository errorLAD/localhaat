'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBusiness } from '../../../context/BusinessContext';
import { api } from '../../../lib/api';
import { Parcel } from '../../../types';
import {
  Package,
  PlusCircle,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  AlertCircle,
  X,
  Send,
  Boxes,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

function BusinessShipmentsContent() {
  const searchParams = useSearchParams();
  const { business, pickupLocations, createShipment, createBulkShipments } = useBusiness();

  const [shipments, setShipments] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Single Shipment Modal
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleForm, setSingleForm] = useState({
    pickupLocation: '',
    pickupAddress: '',
    receiverName: '',
    receiverMobile: '',
    deliveryLocation: '',
    deliveryAddress: '',
    whatIsInside: 'Commercial Goods',
    parcelCategory: 'Commercial Consignment',
    weightKg: 1.5,
    approximateValue: 1200,
    preferredLogisticsType: 'Tata Ace / Small Truck',
    specialInstructions: 'Handle with care',
  });
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Bulk Shipment Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { receiverName: '', receiverMobile: '', deliveryLocation: '', whatIsInside: 'B2B Consignment', weightKg: 1 },
    { receiverName: '', receiverMobile: '', deliveryLocation: '', whatIsInside: 'B2B Consignment', weightKg: 1 },
  ]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') setShowSingleModal(true);
    if (action === 'bulk') setShowBulkModal(true);
    const statusParam = searchParams.get('status');
    if (statusParam) setActiveTab(statusParam);
  }, [searchParams]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinessShipments({
        status: activeTab,
        search: searchTerm,
      });
      if (res.success) {
        setShipments(res.shipments || []);
      }
    } catch (err: any) {
      console.error('Failed to load shipments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [activeTab, searchTerm]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleSubmitting(true);
    try {
      const res = await createShipment({
        ...singleForm,
        pickupLocation: singleForm.pickupLocation || business?.registeredAddress?.villageOrCity || 'Warehouse Hub',
        pickupAddress: singleForm.pickupAddress || business?.registeredAddress?.addressLine || 'Warehouse Cluster',
      });
      if (res.success) {
        setSuccessBooking(res);
        fetchShipments();
      }
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setSingleSubmitting(false);
    }
  };

  const handleAddBulkRow = () => {
    setBulkRows((prev) => [
      ...prev,
      { receiverName: '', receiverMobile: '', deliveryLocation: '', whatIsInside: 'B2B Consignment', weightKg: 1 },
    ]);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter((r) => r.receiverName && r.receiverMobile && r.deliveryLocation);
    if (validRows.length === 0) {
      alert('Please fill out at least one complete recipient row.');
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await createBulkShipments(validRows);
      if (res.success) {
        alert(`Success! Created batch of ${res.count} shipments.`);
        setShowBulkModal(false);
        fetchShipments();
      }
    } catch (err: any) {
      alert(`Bulk booking failed: ${err.message}`);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const calcEstimatedFee = (weight: number) => {
    return Math.round(60 + Math.max(0, weight - 1) * 15);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Shipments & Tracking
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Book commercial consignments, track real-time delivery legs, and retrieve driver pickup verification PINs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => fetchShipments()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setShowBulkModal(true)}
            variant="outline"
            size="sm"
            className="rounded-xl border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Bulk Dispatch
          </Button>

          <Button
            onClick={() => {
              setSuccessBooking(null);
              setShowSingleModal(true);
            }}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Book Shipment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Shipments' },
            { id: 'active', label: 'Active In-Transit' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search tracking, recipient, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading consignments...
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No shipments found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No shipments matching this filter. Click 'Book Shipment' above to create a dispatch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Recipient Info</th>
                  <th className="py-3 px-4">Origin Hub</th>
                  <th className="py-3 px-4">Cargo / Weight</th>
                  <th className="py-3 px-4">Pickup Handoff PIN</th>
                  <th className="py-3 px-4">Logistics Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.map((parcel) => (
                  <tr key={parcel._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900">
                          {parcel.parcelTrackingNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(parcel.parcelTrackingNumber)}
                          className="text-gray-400 hover:text-gray-700"
                          title="Copy tracking number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {copiedId === parcel.parcelTrackingNumber && (
                        <span className="text-[10px] text-emerald-600 font-bold block">Copied!</span>
                      )}
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{parcel.receiverName || 'Recipient'}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{parcel.receiverMobile}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{parcel.deliveryLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 font-medium truncate max-w-[120px]">
                        {parcel.pickupLocation || 'Warehouse Hub'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium">{parcel.whatIsInside || 'Goods'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {parcel.weightKg} kg • {parcel.preferredLogisticsType || 'Cargo'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {parcel.pickupCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900">
                        ₹{parcel.customerOfferPrice || 60}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          ['DELIVERED', 'delivered'].includes(parcel.status)
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold'
                            : ['PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(parcel.status)
                            ? 'bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-bold animate-pulse'
                            : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                        }
                      >
                        {parcel.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/track/${parcel.parcelTrackingNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SINGLE SHIPMENT MODAL */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900">Book B2B Shipment</h3>
              </div>
              <button
                onClick={() => {
                  setShowSingleModal(false);
                  setSuccessBooking(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successBooking ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">
                  Shipment Successfully Booked!
                </h4>
                <p className="text-xs text-emerald-800">
                  Tracking Number: <strong className="font-mono text-sm block mt-1">{successBooking.parcel.parcelTrackingNumber}</strong>
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 inline-block text-center mt-2">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Transporter Pickup Code</span>
                  <span className="font-mono font-extrabold text-lg text-indigo-700">
                    {successBooking.pickupCode}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Share this 4-digit code with the driver upon pickup</p>
                </div>
                <div className="pt-3">
                  <Button
                    onClick={() => {
                      setSuccessBooking(null);
                      setShowSingleModal(false);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold px-6"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Pickup Warehouse Point</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                      value={singleForm.pickupLocation}
                      onChange={(e) => setSingleForm({ ...singleForm, pickupLocation: e.target.value })}
                    >
                      <option value="">Default Business Warehouse</option>
                      {pickupLocations?.map((loc: any, idx: number) => (
                        <option key={idx} value={loc.villageOrCity}>
                          {loc.addressLine} ({loc.villageOrCity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Logistics Transport Type</label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                      value={singleForm.preferredLogisticsType}
                      onChange={(e) => setSingleForm({ ...singleForm, preferredLogisticsType: e.target.value })}
                    >
                      <option value="Tata Ace / Small Truck">Tata Ace / Small Truck</option>
                      <option value="Bike Courier">Bike Express</option>
                      <option value="E-Rickshaw / Auto">E-Rickshaw / Auto</option>
                      <option value="Medium Freight Truck">Medium Freight Truck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Recipient Name *</label>
                    <Input
                      required
                      placeholder="e.g. Shyam Traders"
                      value={singleForm.receiverName}
                      onChange={(e) => setSingleForm({ ...singleForm, receiverName: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Recipient Mobile *</label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={singleForm.receiverMobile}
                      onChange={(e) => setSingleForm({ ...singleForm, receiverMobile: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Destination Village / City *</label>
                    <Input
                      required
                      placeholder="e.g. Barabanki, Mandi Hub"
                      value={singleForm.deliveryLocation}
                      onChange={(e) => setSingleForm({ ...singleForm, deliveryLocation: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Delivery Street / Shop Address</label>
                    <Input
                      placeholder="Shop #4, Main Market"
                      value={singleForm.deliveryAddress}
                      onChange={(e) => setSingleForm({ ...singleForm, deliveryAddress: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Cargo Contents</label>
                    <Input
                      placeholder="e.g. Agricultural Tools"
                      value={singleForm.whatIsInside}
                      onChange={(e) => setSingleForm({ ...singleForm, whatIsInside: e.target.value })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={singleForm.weightKg}
                      onChange={(e) => setSingleForm({ ...singleForm, weightKg: Number(e.target.value) })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Declared Value (₹)</label>
                    <Input
                      type="number"
                      value={singleForm.approximateValue}
                      onChange={(e) => setSingleForm({ ...singleForm, approximateValue: Number(e.target.value) })}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-indigo-900 font-bold block">Estimated Delivery Fee:</span>
                    <span className="text-[11px] text-indigo-700">₹60 base fee + ₹15/kg surplus</span>
                  </div>
                  <span className="text-lg font-mono font-extrabold text-indigo-900">
                    ₹{calcEstimatedFee(singleForm.weightKg)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={singleSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 text-xs"
                >
                  {singleSubmitting ? 'Booking Consignment...' : 'Confirm & Dispatch Shipment'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BULK SHIPMENT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Bulk Consignment Batch Entry</h3>
                  <p className="text-[11px] text-gray-500">Dispatch multiple orders simultaneously with instant tracking IDs</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {bulkRows.map((row, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs">
                    <Input
                      placeholder="Receiver Name"
                      value={row.receiverName}
                      onChange={(e) => {
                        const copy = [...bulkRows];
                        copy[idx].receiverName = e.target.value;
                        setBulkRows(copy);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                    <Input
                      placeholder="Receiver Phone"
                      value={row.receiverMobile}
                      onChange={(e) => {
                        const copy = [...bulkRows];
                        copy[idx].receiverMobile = e.target.value;
                        setBulkRows(copy);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                    <Input
                      placeholder="Destination (City/Village)"
                      value={row.deliveryLocation}
                      onChange={(e) => {
                        const copy = [...bulkRows];
                        copy[idx].deliveryLocation = e.target.value;
                        setBulkRows(copy);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                    <Input
                      placeholder="Cargo Description"
                      value={row.whatIsInside}
                      onChange={(e) => {
                        const copy = [...bulkRows];
                        copy[idx].whatIsInside = e.target.value;
                        setBulkRows(copy);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={row.weightKg}
                      onChange={(e) => {
                        const copy = [...bulkRows];
                        copy[idx].weightKg = Number(e.target.value);
                        setBulkRows(copy);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBulkRow}
                  className="rounded-xl text-xs font-semibold"
                >
                  + Add Consignment Row
                </Button>

                <div className="text-xs text-gray-500">
                  Total in batch: <strong className="text-gray-900 font-bold">{bulkRows.length} packages</strong>
                </div>
              </div>

              <Button
                type="submit"
                disabled={bulkSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 text-xs"
              >
                {bulkSubmitting ? 'Registering Consignment Batch...' : `Submit Batch (${bulkRows.length} Shipments)`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessShipmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
          <span>Loading Shipments...</span>
        </div>
      }
    >
      <BusinessShipmentsContent />
    </Suspense>
  );
}

