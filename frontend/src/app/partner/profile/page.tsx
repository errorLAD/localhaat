'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePartner } from '../../../context/PartnerContext';
import {
  User,
  Truck,
  MapPin,
  Building2,
  Bike,
  Users,
  Compass,
  Navigation,
  FileText,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Save,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Camera,
  Upload,
  Calendar,
  Layers,
  Check,
  X,
  Crosshair,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  PartnerLocation,
  PartnerShop,
  PartnerDriver,
  Vehicle,
  PartnerRoute,
  LogisticsTrip,
} from '../../../types';

type ActiveTab =
  | 'profile'
  | 'locations'
  | 'shops'
  | 'transport'
  | 'drivers'
  | 'routes'
  | 'trips'
  | 'documents'
  | 'earnings';

export default function PartnerProfilePage() {
  const { user } = useAuth();
  const {
    partner,
    locations,
    shops,
    vehicles,
    drivers,
    routes,
    trips,
    documents,
    stats,
    loading,
    loadFullProfile,
    handleUpdateProfile,
    handleCreateLocation,
    handleUpdateLocation,
    handleDeactivateLocation,
    handleCreateShop,
    handleUpdateShop,
    handleDeactivateShop,
    handleCreateDriver,
    handleUpdateDriver,
    handleDeactivateDriver,
    handleRegisterVehicle,
    handleUpdateVehicle,
    handleDeactivateVehicle,
    handleCreateRoute,
    handleCreateTrip,
    handleUpdateTripStatus,
    handleUploadDocument,
    handleRequestPayout,
  } = usePartner();

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  // Load data on mount
  useEffect(() => {
    loadFullProfile();
  }, []);

  // -------------------------------------------------------------
  // 1. BASIC PROFILE STATE
  // -------------------------------------------------------------
  const [personalName, setPersonalName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(partner?.businessName || '');
  const [contactPhone, setContactPhone] = useState(partner?.phone || user?.phone || '');
  const [contactEmail, setContactEmail] = useState(partner?.email || user?.email || '');
  const [addressLine, setAddressLine] = useState(partner?.address?.addressLine || '');
  const [village, setVillage] = useState(partner?.address?.village || '');
  const [district, setDistrict] = useState(partner?.address?.district || 'Darbhanga');
  const [stateName, setStateName] = useState(partner?.address?.state || 'Bihar');
  const [pincode, setPincode] = useState(partner?.address?.pincode || '846004');
  const [partnerCategory, setPartnerCategory] = useState<'PROFESSIONAL' | 'TRAVELLING'>(
    partner?.partnerCategory || 'PROFESSIONAL'
  );
  const [bankAccHolder, setBankAccHolder] = useState(partner?.bankDetails?.accountHolderName || '');
  const [bankAccNum, setBankAccNum] = useState(partner?.bankDetails?.accountNumber || '');
  const [bankIfsc, setBankIfsc] = useState(partner?.bankDetails?.ifscCode || '');
  const [bankName, setBankName] = useState(partner?.bankDetails?.bankName || '');
  const [bankUpi, setBankUpi] = useState(partner?.bankDetails?.upiId || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    if (partner) {
      setBusinessName(partner.businessName || '');
      setContactPhone(partner.phone || user?.phone || '');
      setContactEmail(partner.email || user?.email || '');
      setAddressLine(partner.address?.addressLine || '');
      setVillage(partner.address?.village || '');
      setDistrict(partner.address?.district || 'Darbhanga');
      setStateName(partner.address?.state || 'Bihar');
      setPincode(partner.address?.pincode || '846004');
      setPartnerCategory(partner.partnerCategory || 'PROFESSIONAL');
      setBankAccHolder(partner.bankDetails?.accountHolderName || '');
      setBankAccNum(partner.bankDetails?.accountNumber || '');
      setBankIfsc(partner.bankDetails?.ifscCode || '');
      setBankName(partner.bankDetails?.bankName || '');
      setBankUpi(partner.bankDetails?.upiId || '');
    }
  }, [partner, user]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');
    const ok = await handleUpdateProfile({
      name: personalName,
      businessName,
      phone: contactPhone,
      email: contactEmail,
      partnerCategory,
      address: {
        addressLine,
        village,
        district,
        state: stateName,
        pincode,
      },
      bankDetails: {
        accountHolderName: bankAccHolder,
        accountNumber: bankAccNum,
        ifscCode: bankIfsc,
        bankName,
        upiId: bankUpi,
      },
    });
    setProfileSaving(false);
    if (ok) {
      setProfileSuccessMsg('Profile details saved successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    }
  };

  // -------------------------------------------------------------
  // 2. LOCATION MODAL STATE (PICKUP / DROP)
  // -------------------------------------------------------------
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locDefaultType, setLocDefaultType] = useState<'PICKUP' | 'DROP'>('PICKUP');
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState<string>('Pickup Point');
  const [locIsPickup, setLocIsPickup] = useState(true);
  const [locIsDrop, setLocIsDrop] = useState(false);
  const [locAddress, setLocAddress] = useState('');
  const [locVillage, setLocVillage] = useState('');
  const [locArea, setLocArea] = useState('');
  const [locBlock, setLocBlock] = useState('');
  const [locDistrict, setLocDistrict] = useState('Darbhanga');
  const [locState, setLocState] = useState('Bihar');
  const [locPinCode, setLocPinCode] = useState('');
  const [locLandmark, setLocLandmark] = useState('');
  const [locContactPerson, setLocContactPerson] = useState('');
  const [locContactMobile, setLocContactMobile] = useState('');
  const [locLat, setLocLat] = useState<string>('');
  const [locLng, setLocLng] = useState<string>('');
  const [locDetectingGps, setLocDetectingGps] = useState(false);
  const [locSaving, setLocSaving] = useState(false);

  const openAddLocationModal = (type: 'PICKUP' | 'DROP') => {
    setEditingLocationId(null);
    setLocDefaultType(type);
    setLocName('');
    setLocType(type === 'PICKUP' ? 'Pickup Point' : 'Drop Point');
    setLocIsPickup(type === 'PICKUP');
    setLocIsDrop(type === 'DROP');
    setLocAddress('');
    setLocVillage('');
    setLocArea('');
    setLocBlock('');
    setLocDistrict(district || 'Darbhanga');
    setLocState('Bihar');
    setLocPinCode(pincode || '');
    setLocLandmark('');
    setLocContactPerson(personalName || '');
    setLocContactMobile(contactPhone || '');
    setLocLat('');
    setLocLng('');
    setLocationModalOpen(true);
  };

  const openEditLocationModal = (loc: PartnerLocation) => {
    setEditingLocationId(loc._id);
    setLocDefaultType(loc.isPickup ? 'PICKUP' : 'DROP');
    setLocName(loc.name);
    setLocType(loc.locationType);
    setLocIsPickup(loc.isPickup);
    setLocIsDrop(loc.isDrop);
    setLocAddress(loc.address);
    setLocVillage(loc.village || '');
    setLocArea(loc.area || '');
    setLocBlock(loc.block || '');
    setLocDistrict(loc.district);
    setLocState(loc.state);
    setLocPinCode(loc.pinCode);
    setLocLandmark(loc.landmark || '');
    setLocContactPerson(loc.contactName || '');
    setLocContactMobile(loc.contactMobile || '');
    setLocLat(loc.latitude ? String(loc.latitude) : '');
    setLocLng(loc.longitude ? String(loc.longitude) : '');
    setLocationModalOpen(true);
  };

  const detectLocationGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLat(pos.coords.latitude.toFixed(6));
        setLocLng(pos.coords.longitude.toFixed(6));
        setLocDetectingGps(false);
      },
      (err) => {
        alert('Could not fetch GPS location: ' + err.message);
        setLocDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locAddress.trim() || !locDistrict.trim() || !locPinCode.trim()) {
      alert('Please fill in required fields: Location Name, Full Address, District, and PIN Code.');
      return;
    }
    setLocSaving(true);
    const payload = {
      name: locName,
      locationType: locType,
      isPickup: locIsPickup,
      isDrop: locIsDrop,
      address: locAddress,
      village: locVillage,
      area: locArea,
      block: locBlock,
      district: locDistrict,
      state: locState,
      pinCode: locPinCode,
      landmark: locLandmark,
      contactName: locContactPerson,
      contactMobile: locContactMobile,
      latitude: locLat ? parseFloat(locLat) : undefined,
      longitude: locLng ? parseFloat(locLng) : undefined,
    };

    let ok = false;
    if (editingLocationId) {
      ok = await handleUpdateLocation(editingLocationId, payload);
    } else {
      ok = await handleCreateLocation(payload);
    }
    setLocSaving(false);
    if (ok) {
      setLocationModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 3. SHOPS / BUSINESS LOCATIONS MODAL STATE
  // -------------------------------------------------------------
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopPhoto, setShopPhoto] = useState('');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [shopMobile, setShopMobile] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopVillage, setShopVillage] = useState('');
  const [shopArea, setShopArea] = useState('');
  const [shopBlock, setShopBlock] = useState('');
  const [shopDistrict, setShopDistrict] = useState('Darbhanga');
  const [shopState, setShopState] = useState('Bihar');
  const [shopPinCode, setShopPinCode] = useState('');
  const [shopLandmark, setShopLandmark] = useState('');
  const [shopType, setShopType] = useState('Logistics Point');
  const [shopOpenTime, setShopOpenTime] = useState('08:00 AM');
  const [shopCloseTime, setShopCloseTime] = useState('08:00 PM');
  const [shopPickupAvail, setShopPickupAvail] = useState(true);
  const [shopDropAvail, setShopDropAvail] = useState(true);
  const [shopHoldingAvail, setShopHoldingAvail] = useState(true);
  const [shopHoldingCap, setShopHoldingCap] = useState('100 Parcels / 500 kg');
  const [shopLat, setShopLat] = useState('');
  const [shopLng, setShopLng] = useState('');
  const [shopDetectingGps, setShopDetectingGps] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);

  const openAddShopModal = () => {
    setEditingShopId(null);
    setShopName('');
    setShopPhoto('');
    setShopOwnerName(personalName || '');
    setShopMobile(contactPhone || '');
    setShopEmail(contactEmail || '');
    setShopAddress('');
    setShopVillage('');
    setShopArea('');
    setShopBlock('');
    setShopDistrict(district || 'Darbhanga');
    setShopState('Bihar');
    setShopPinCode(pincode || '');
    setShopLandmark('');
    setShopType('Logistics Point');
    setShopOpenTime('08:00 AM');
    setShopCloseTime('08:00 PM');
    setShopPickupAvail(true);
    setShopDropAvail(true);
    setShopHoldingAvail(true);
    setShopHoldingCap('100 Parcels / 500 kg');
    setShopLat('');
    setShopLng('');
    setShopModalOpen(true);
  };

  const openEditShopModal = (s: PartnerShop) => {
    setEditingShopId(s._id);
    setShopName(s.name);
    setShopPhoto(s.photo || '');
    setShopOwnerName(s.ownerName);
    setShopMobile(s.mobile);
    setShopEmail(s.email || '');
    setShopAddress(s.address);
    setShopVillage(s.village);
    setShopArea(s.area || '');
    setShopBlock(s.block || '');
    setShopDistrict(s.district);
    setShopState(s.state);
    setShopPinCode(s.pinCode);
    setShopLandmark(s.landmark || '');
    setShopType(s.shopType);
    setShopOpenTime(s.openingTime || '08:00 AM');
    setShopCloseTime(s.closingTime || '08:00 PM');
    setShopPickupAvail(s.pickupAvailable);
    setShopDropAvail(s.dropAvailable);
    setShopHoldingAvail(s.parcelHoldingAvailable);
    setShopHoldingCap(s.holdingCapacity || '100 Parcels / 500 kg');
    setShopLat(s.latitude ? String(s.latitude) : '');
    setShopLng(s.longitude ? String(s.longitude) : '');
    setShopModalOpen(true);
  };

  const detectShopGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setShopDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setShopLat(pos.coords.latitude.toFixed(6));
        setShopLng(pos.coords.longitude.toFixed(6));
        setShopDetectingGps(false);
      },
      (err) => {
        alert('Could not fetch GPS location: ' + err.message);
        setShopDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !shopOwnerName.trim() || !shopMobile.trim() || !shopAddress.trim() || !shopVillage.trim()) {
      alert('Please fill in required fields: Shop Name, Owner Name, Mobile, Address, Village, and PIN Code.');
      return;
    }
    setShopSaving(true);
    const payload = {
      name: shopName,
      photo: shopPhoto,
      ownerName: shopOwnerName,
      mobile: shopMobile,
      email: shopEmail,
      address: shopAddress,
      village: shopVillage,
      area: shopArea,
      block: shopBlock,
      district: shopDistrict,
      state: shopState,
      pinCode: shopPinCode,
      landmark: shopLandmark,
      shopType,
      openingTime: shopOpenTime,
      closingTime: shopCloseTime,
      pickupAvailable: shopPickupAvail,
      dropAvailable: shopDropAvail,
      parcelHoldingAvailable: shopHoldingAvail,
      holdingCapacity: shopHoldingCap,
      latitude: shopLat ? parseFloat(shopLat) : undefined,
      longitude: shopLng ? parseFloat(shopLng) : undefined,
    };

    let ok = false;
    if (editingShopId) {
      ok = await handleUpdateShop(editingShopId, payload);
    } else {
      ok = await handleCreateShop(payload);
    }
    setShopSaving(false);
    if (ok) {
      setShopModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 4. VEHICLE MODAL STATE
  // -------------------------------------------------------------
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehType, setVehType] = useState('Pickup (Tata Ace / Bolero Maxi)');
  const [vehRegNum, setVehRegNum] = useState('');
  const [vehModel, setVehModel] = useState('Tata Ace Gold');
  const [vehCapacityKg, setVehCapacityKg] = useState('750');
  const [vehPhotoUrl, setVehPhotoUrl] = useState('');
  const [vehPlatePhotoUrl, setVehPlatePhotoUrl] = useState('');
  const [vehRcDocUrl, setVehRcDocUrl] = useState('');
  const [vehAssignedDriverId, setVehAssignedDriverId] = useState('');
  const [vehSaving, setVehSaving] = useState(false);

  const openAddVehicleModal = () => {
    setEditingVehicleId(null);
    setVehType('Pickup (Tata Ace / Bolero Maxi)');
    setVehRegNum('');
    setVehModel('Tata Ace Gold');
    setVehCapacityKg('750');
    setVehPhotoUrl('');
    setVehPlatePhotoUrl('');
    setVehRcDocUrl('');
    setVehAssignedDriverId('');
    setVehicleModalOpen(true);
  };

  const openEditVehicleModal = (v: Vehicle) => {
    setEditingVehicleId(v._id);
    setVehType(v.vehicleType);
    setVehRegNum(v.registrationNumber);
    setVehModel(v.modelName || v.model || '');
    setVehCapacityKg(String(v.maxCapacityKg));
    setVehPhotoUrl(v.photoUrl || '');
    setVehPlatePhotoUrl(v.numberPlatePhotoUrl || '');
    setVehRcDocUrl(v.rcDocUrl || '');
    setVehAssignedDriverId(v.driverId || '');
    setVehicleModalOpen(true);
  };

  const onSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehRegNum.trim() || !vehModel.trim()) {
      alert('Please fill in Registration Number and Model Name.');
      return;
    }
    setVehSaving(true);
    const assignedDriver = drivers.find((d) => d._id === vehAssignedDriverId);
    const payload = {
      vehicleType: vehType,
      registrationNumber: vehRegNum.toUpperCase().trim(),
      modelName: vehModel.trim(),
      maxCapacityKg: Number(vehCapacityKg) || 50,
      photoUrl: vehPhotoUrl,
      numberPlatePhotoUrl: vehPlatePhotoUrl,
      rcDocUrl: vehRcDocUrl,
      driverId: vehAssignedDriverId || undefined,
      driverName: assignedDriver?.name,
    };

    let ok = false;
    if (editingVehicleId) {
      ok = await handleUpdateVehicle(editingVehicleId, payload);
    } else {
      ok = await handleRegisterVehicle(payload);
    }
    setVehSaving(false);
    if (ok) {
      setVehicleModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 5. DRIVER MODAL STATE
  // -------------------------------------------------------------
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [drvName, setDrvName] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvAadhaar, setDrvAadhaar] = useState('');
  const [drvAadhaarDocUrl, setDrvAadhaarDocUrl] = useState('');
  const [drvLicense, setDrvLicense] = useState('');
  const [drvLicenseDocUrl, setDrvLicenseDocUrl] = useState('');
  const [drvPhotoUrl, setDrvPhotoUrl] = useState('');
  const [drvAssignedVehId, setDrvAssignedVehId] = useState('');
  const [drvSaving, setDrvSaving] = useState(false);

  const openAddDriverModal = () => {
    setEditingDriverId(null);
    setDrvName('');
    setDrvPhone('');
    setDrvAadhaar('');
    setDrvAadhaarDocUrl('');
    setDrvLicense('');
    setDrvLicenseDocUrl('');
    setDrvPhotoUrl('');
    setDrvAssignedVehId('');
    setDriverModalOpen(true);
  };

  const openEditDriverModal = (d: PartnerDriver) => {
    setEditingDriverId(d._id);
    setDrvName(d.name);
    setDrvPhone(d.phone);
    setDrvAadhaar(d.aadhaarNumber || '');
    setDrvAadhaarDocUrl(d.aadhaarDocUrl || '');
    setDrvLicense(d.licenseNumber || '');
    setDrvLicenseDocUrl(d.licenseDocUrl || '');
    setDrvPhotoUrl(d.photoUrl || '');
    setDrvAssignedVehId(d.assignedVehicleId?._id || d.assignedVehicleId || '');
    setDriverModalOpen(true);
  };

  const onSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drvName.trim() || !drvPhone.trim()) {
      alert('Driver Name and Phone are required.');
      return;
    }
    setDrvSaving(true);
    const payload = {
      name: drvName.trim(),
      phone: drvPhone.trim(),
      aadhaarNumber: drvAadhaar.trim(),
      aadhaarDocUrl: drvAadhaarDocUrl,
      licenseNumber: drvLicense.trim(),
      licenseDocUrl: drvLicenseDocUrl,
      photoUrl: drvPhotoUrl,
      assignedVehicleId: drvAssignedVehId || undefined,
    };

    let ok = false;
    if (editingDriverId) {
      ok = await handleUpdateDriver(editingDriverId, payload);
    } else {
      ok = await handleCreateDriver(payload);
    }
    setDrvSaving(false);
    if (ok) {
      setDriverModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 6. ROUTE MODAL STATE (CONNECTING SAVED LOCATIONS)
  // -------------------------------------------------------------
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [routeSrcId, setRouteSrcId] = useState('');
  const [routeDstId, setRouteDstId] = useState('');
  const [routeFrequency, setRouteFrequency] = useState('daily');
  const [routeDepTime, setRouteDepTime] = useState('08:00 AM');
  const [routeVehType, setRouteVehType] = useState('Pickup');
  const [routeCapKg, setRouteCapKg] = useState('500');
  const [routePriceKg, setRoutePriceKg] = useState('10');
  const [routeSaving, setRouteSaving] = useState(false);

  const openAddRouteModal = () => {
    setRouteTitle('');
    setRouteSrcId(locations[0]?._id || shops[0]?._id || '');
    setRouteDstId(locations[1]?._id || shops[1]?._id || '');
    setRouteFrequency('daily');
    setRouteDepTime('08:00 AM');
    setRouteVehType('Pickup');
    setRouteCapKg('500');
    setRoutePriceKg('10');
    setRouteModalOpen(true);
  };

  const onSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteSaving(true);

    // Resolve source & dest from saved locations or shops
    const srcLoc =
      locations.find((l) => l._id === routeSrcId) ||
      shops.find((s) => s._id === routeSrcId);
    const dstLoc =
      locations.find((l) => l._id === routeDstId) ||
      shops.find((s) => s._id === routeDstId);

    const sourceData = srcLoc
      ? {
          addressLine: srcLoc.address,
          villageOrCity: (srcLoc as any).village || srcLoc.name,
          district: srcLoc.district,
          state: srcLoc.state,
          pincode: srcLoc.pinCode,
        }
      : { addressLine: 'Origin Depot', villageOrCity: 'Darbhanga', district: 'Darbhanga', state: 'Bihar', pincode: '846004' };

    const destData = dstLoc
      ? {
          addressLine: dstLoc.address,
          villageOrCity: (dstLoc as any).village || dstLoc.name,
          district: dstLoc.district,
          state: dstLoc.state,
          pincode: dstLoc.pinCode,
        }
      : { addressLine: 'Destination Depot', villageOrCity: 'Madhubani', district: 'Madhubani', state: 'Bihar', pincode: '847211' };

    const title =
      routeTitle.trim() ||
      `${sourceData.villageOrCity} ➔ ${destData.villageOrCity} Regular Route`;

    const ok = await handleCreateRoute({
      routeTitle: title,
      sourceLocation: sourceData,
      destinationLocation: destData,
      sourceLocationId: routeSrcId || undefined,
      destinationLocationId: routeDstId || undefined,
      scheduledFrequency: routeFrequency,
      departureTime: routeDepTime,
      vehicleType: routeVehType,
      capacityKg: Number(routeCapKg) || 500,
      pricePerKg: Number(routePriceKg) || 10,
    });
    setRouteSaving(false);
    if (ok) {
      setRouteModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 7. TRIP MODAL STATE (STOP-BY-STOP WITH SAVED LOCATIONS)
  // -------------------------------------------------------------
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripRouteTitle, setTripRouteTitle] = useState('');
  const [tripStartLocId, setTripStartLocId] = useState('');
  const [tripEndLocId, setTripEndLocId] = useState('');
  const [tripVehicleId, setTripVehicleId] = useState('');
  const [tripTravelDate, setTripTravelDate] = useState('Today');
  const [tripDepTime, setTripDepTime] = useState('08:30 AM');
  const [tripArrTime, setTripArrTime] = useState('12:00 PM');
  const [tripCapKg, setTripCapKg] = useState('500');
  const [tripStops, setTripStops] = useState<Array<{ id: string; name: string; stopLocationId?: string }>>([]);
  const [tripSaving, setTripSaving] = useState(false);

  const openAddTripModal = () => {
    setTripRouteTitle('');
    setTripStartLocId(locations[0]?._id || shops[0]?._id || '');
    setTripEndLocId(locations[1]?._id || shops[1]?._id || '');
    setTripVehicleId(vehicles[0]?._id || '');
    setTripTravelDate('Today');
    setTripDepTime('08:30 AM');
    setTripArrTime('12:00 PM');
    setTripCapKg('500');
    setTripStops([]);
    setTripModalOpen(true);
  };

  const addTripStop = () => {
    const defaultCandidate =
      locations.find((l) => l._id !== tripStartLocId && l._id !== tripEndLocId) ||
      shops[0];
    setTripStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}-${prev.length + 1}`,
        name: defaultCandidate?.name || `Waypoint Stop ${prev.length + 1}`,
        stopLocationId: defaultCandidate?._id || '',
      },
    ]);
  };

  const removeTripStop = (idx: number) => {
    setTripStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTripStop = (idx: number, stopLocationId: string) => {
    const locObj =
      locations.find((l) => l._id === stopLocationId) ||
      shops.find((s) => s._id === stopLocationId);
    setTripStops((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              stopLocationId,
              name: locObj?.name || s.name,
            }
          : s
      )
    );
  };

  const onSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setTripSaving(true);

    const startObj =
      locations.find((l) => l._id === tripStartLocId) ||
      shops.find((s) => s._id === tripStartLocId);
    const endObj =
      locations.find((l) => l._id === tripEndLocId) ||
      shops.find((s) => s._id === tripEndLocId);

    const vehObj = vehicles.find((v) => v._id === tripVehicleId);

    const payload = {
      routeTitle:
        tripRouteTitle.trim() ||
        `${startObj?.name || 'Origin'} ➔ ${endObj?.name || 'Destination'} Corridor Trip`,
      transportType: vehObj?.vehicleType || partner?.primaryTransportType || 'Pickup',
      vehicleId: tripVehicleId || undefined,
      vehicleNumber: vehObj?.registrationNumber,
      travelDate: tripTravelDate,
      departureTime: tripDepTime,
      expectedArrival: tripArrTime,
      startLocation: {
        name: startObj?.name || 'Start Point',
        villageOrCity: (startObj as any)?.village || startObj?.name,
        address: startObj?.address,
        district: startObj?.district,
        latitude: startObj?.latitude,
        longitude: startObj?.longitude,
      },
      finalDestination: {
        name: endObj?.name || 'Final Destination',
        villageOrCity: (endObj as any)?.village || endObj?.name,
        address: endObj?.address,
        district: endObj?.district,
        latitude: endObj?.latitude,
        longitude: endObj?.longitude,
      },
      stops: tripStops.map((st, i) => {
        const found =
          locations.find((l) => l._id === st.stopLocationId) ||
          shops.find((s) => s._id === st.stopLocationId);
        return {
          stopId: `STOP-${i + 1}`,
          stopOrder: i + 1,
          name: found?.name || st.name,
          villageOrCity: (found as any)?.village || found?.name,
          address: found?.address,
          latitude: found?.latitude,
          longitude: found?.longitude,
          expectedArrival: '10:00 AM',
          expectedDeparture: '10:15 AM',
        };
      }),
      totalCapacityKg: Number(tripCapKg) || 500,
    };

    const ok = await handleCreateTrip(payload);
    setTripSaving(false);
    if (ok) {
      setTripModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 8. PAYOUT MODAL STATE
  // -------------------------------------------------------------
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMode, setPayoutMode] = useState('BANK_TRANSFER');
  const [payoutSaving, setPayoutSaving] = useState(false);

  const onSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (amt > (partner?.walletBalance || 0)) {
      alert(`Requested amount ₹${amt} exceeds available balance ₹${partner?.walletBalance || 0}`);
      return;
    }
    setPayoutSaving(true);
    const ok = await handleRequestPayout(amt, payoutMode);
    setPayoutSaving(false);
    if (ok) {
      setPayoutModalOpen(false);
      setPayoutAmount('');
    }
  };

  // -------------------------------------------------------------
  // 9. DOCUMENT UPLOAD MODAL STATE
  // -------------------------------------------------------------
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('VEHICLE_RC');
  const [docNumber, setDocNumber] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docSaving, setDocSaving] = useState(false);

  const onSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim() || !docUrl.trim()) {
      alert('Please provide Document Number and File URL.');
      return;
    }
    setDocSaving(true);
    const ok = await handleUploadDocument({
      documentType: docType,
      documentNumber: docNumber.trim(),
      documentUrl: docUrl.trim(),
    });
    setDocSaving(false);
    if (ok) {
      setDocModalOpen(false);
      setDocNumber('');
      setDocUrl('');
    }
  };

  // Combine saved locations & shops for dropdown selection in Trips & Routes
  const allSelectablePoints = [
    ...locations.map((l) => ({
      id: l._id,
      label: `${l.name} (${l.locationType} - ${l.district})`,
      obj: l,
      type: 'LOCATION',
    })),
    ...shops.map((s) => ({
      id: s._id,
      label: `${s.name} (${s.shopType} - ${s.district})`,
      obj: s,
      type: 'SHOP',
    })),
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================= */}
      {/* TOP HERO PROFILE BANNER */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
              {partner?.businessName?.[0] || user?.name?.[0] || 'L'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {partner?.businessName || user?.name || 'LocalHaat Logistics Partner'}
                </h1>
                <Badge
                  className={
                    partnerCategory === 'PROFESSIONAL'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }
                >
                  {partnerCategory === 'PROFESSIONAL'
                    ? 'Professional Logistics Partner'
                    : 'Travelling Partner / Commuter'}
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-mono">
                  {partner?.partnerCode || 'LP-1021'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {partner?.phone || user?.phone || 'No phone registered'}
                </span>
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {user.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {district}, {stateName}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  KYC Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                Wallet
              </span>
              <span className="text-base font-extrabold text-blue-900 font-mono">
                ₹{partner?.walletBalance || 0}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Trips
              </span>
              <span className="text-base font-extrabold text-emerald-900 font-mono">
                {partner?.totalTrips || trips.length || 0}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block">
                Vehicles
              </span>
              <span className="text-base font-extrabold text-purple-900 font-mono">
                {vehicles.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-6 mt-6 border-t border-gray-100 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile Info
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'locations'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Pickup & Drop Locations ({locations.length})
          </button>

          {partnerCategory === 'PROFESSIONAL' && (
            <button
              onClick={() => setActiveTab('shops')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'shops'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Shops & Business Locations ({shops.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('transport')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'transport'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Vehicles ({vehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'drivers'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Drivers ({drivers.length})
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Saved Routes ({routes.length})
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'trips'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Trips ({trips.length})
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents ({documents.length})
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'earnings'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Earnings & Payouts
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. PROFILE TAB */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={onSaveProfile} className="space-y-6">
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
                <span>Personal & Business Profile Information</span>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  Verified Partner
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {profileSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Person Name
                  </label>
                  <Input
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Registered Business / Transporter Fleet Name
                  </label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Mithila Express Haat Logistics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Phone Number
                  </label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Partner Classification
                  </label>
                  <select
                    value={partnerCategory}
                    onChange={(e) => setPartnerCategory(e.target.value as any)}
                    className="w-full text-xs font-medium rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PROFESSIONAL">Professional Logistics Partner (Fleet & Warehouses)</option>
                    <option value="TRAVELLING">Travelling Partner / Daily Commuter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Operational District
                  </label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Darbhanga"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Depot / Registered Street Address
                </label>
                <Input
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Shop No., Road, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Village / Town
                  </label>
                  <Input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Sakri"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <Input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Bihar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code</label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking / UPI Payout Details */}
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
                <span>Bank Account & UPI Payout Settings</span>
                <span className="text-xs text-gray-500 font-normal">
                  Earnings will be deposited directly here
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <Input
                    value={bankAccHolder}
                    onChange={(e) => setBankAccHolder(e.target.value)}
                    placeholder="Name as printed in passbook"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Account Number
                  </label>
                  <Input
                    value={bankAccNum}
                    onChange={(e) => setBankAccNum(e.target.value)}
                    placeholder="Full account number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <Input
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Direct UPI ID (Instant Payouts)
                  </label>
                  <Input
                    value={bankUpi}
                    onChange={(e) => setBankUpi(e.target.value)}
                    placeholder="mobile@upi or name@okaxis"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. PICKUP & DROP LOCATIONS TAB */}
      {/* ========================================================= */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pickup & Drop Locations</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage multiple operational points, village pick-up hubs, and scheduled drop centers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openAddLocationModal('PICKUP')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Pickup Location
              </Button>
              <Button
                onClick={() => openAddLocationModal('DROP')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Drop Location
              </Button>
            </div>
          </div>

          {/* Section: Pickup Locations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Pickup Locations (
                {locations.filter((l) => l.isPickup && l.isActive).length})
              </h3>
              <button
                onClick={() => openAddLocationModal('PICKUP')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {locations.filter((l) => l.isPickup && l.isActive).length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No pickup locations added yet.</p>
                <Button
                  onClick={() => openAddLocationModal('PICKUP')}
                  variant="outline"
                  className="mt-3 text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Pickup Location
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations
                  .filter((l) => l.isPickup && l.isActive)
                  .map((loc) => (
                    <div
                      key={loc._id}
                      className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">
                            PICKUP LOCATION
                          </span>
                          <Badge variant="outline" className="text-[10px] font-semibold text-gray-600">
                            {loc.locationType}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{loc.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{loc.address}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          {loc.village ? `${loc.village}, ` : ''}
                          {loc.district}, {loc.state} — PIN: {loc.pinCode}
                        </p>
                        {loc.landmark && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Landmark: {loc.landmark}
                          </p>
                        )}
                        {loc.contactName && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                            <span>Contact: {loc.contactName}</span>
                            {loc.contactMobile && <span className="font-mono">{loc.contactMobile}</span>}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditLocationModal(loc)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Deactivate pickup location "${loc.name}"? Historical records will be preserved.`)) {
                              await handleDeactivateLocation(loc._id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section: Drop Locations */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Drop Locations (
                {locations.filter((l) => l.isDrop && l.isActive).length})
              </h3>
              <button
                onClick={() => openAddLocationModal('DROP')}
                className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {locations.filter((l) => l.isDrop && l.isActive).length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No drop locations added yet.</p>
                <Button
                  onClick={() => openAddLocationModal('DROP')}
                  variant="outline"
                  className="mt-3 text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Drop Location
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations
                  .filter((l) => l.isDrop && l.isActive)
                  .map((loc) => (
                    <div
                      key={loc._id}
                      className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wider">
                            DROP LOCATION
                          </span>
                          <Badge variant="outline" className="text-[10px] font-semibold text-gray-600">
                            {loc.locationType}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{loc.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{loc.address}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          {loc.village ? `${loc.village}, ` : ''}
                          {loc.district}, {loc.state} — PIN: {loc.pinCode}
                        </p>
                        {loc.landmark && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Landmark: {loc.landmark}
                          </p>
                        )}
                        {loc.contactName && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                            <span>Contact: {loc.contactName}</span>
                            {loc.contactMobile && <span className="font-mono">{loc.contactMobile}</span>}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditLocationModal(loc)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Deactivate drop location "${loc.name}"? Historical records will be preserved.`)) {
                              await handleDeactivateLocation(loc._id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SHOPS / BUSINESS LOCATIONS TAB */}
      {/* ========================================================= */}
      {activeTab === 'shops' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Shops & Business Locations</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                For partners operating from a local store, village collection point, or intermediate parcel holding depot.
              </p>
            </div>
            <Button
              onClick={openAddShopModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Shop
            </Button>
          </div>

          {shops.filter((s) => s.isActive).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Shops or Depots Added Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Add your local storefront, hardware shop, grocery store, or logistics point to offer parcel collection, holding, and drop-off services.
              </p>
              <Button
                onClick={openAddShopModal}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Shop / Business Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops
                .filter((s) => s.isActive)
                .map((shop) => (
                  <div
                    key={shop._id}
                    className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                          {shop.shopType}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {shop.openingTime} - {shop.closingTime}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900">{shop.name}</h4>

                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p>
                          <strong className="text-gray-700">Owner:</strong> {shop.ownerName}
                        </p>
                        <p>
                          <strong className="text-gray-700">Phone:</strong> {shop.mobile}
                        </p>
                        <p className="leading-relaxed">
                          <strong className="text-gray-700">Location:</strong> {shop.address},{' '}
                          {shop.village}, {shop.district} ({shop.pinCode})
                        </p>
                      </div>

                      {/* Services Badges */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Active Services
                        </span>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {shop.pickupAvailable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              <Check className="w-3 h-3" /> Pickup
                            </span>
                          )}
                          {shop.dropAvailable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                              <Check className="w-3 h-3" /> Drop
                            </span>
                          )}
                          {shop.parcelHoldingAvailable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                              <Check className="w-3 h-3" /> Parcel Holding
                            </span>
                          )}
                        </div>
                        {shop.holdingCapacity && (
                          <p className="text-[11px] text-gray-500 mt-2">
                            Holding Capacity: <strong className="text-gray-700">{shop.holdingCapacity}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditShopModal(shop)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Deactivate shop "${shop.name}"? Historical records will be preserved.`)) {
                            await handleDeactivateShop(shop._id);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TRANSPORT / VEHICLES TAB */}
      {/* ========================================================= */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Registered Commercial Transport</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Pickups, buses, tractor trolleys, auto tempos, e-rickshaws, and fleet transport vehicles.
              </p>
            </div>
            <Button
              onClick={openAddVehicleModal}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Vehicle
            </Button>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Vehicles Registered</h3>
              <p className="text-xs text-gray-500 mt-1">
                Register your vehicle with registration number, payload capacity, and RC documentation.
              </p>
              <Button
                onClick={openAddVehicleModal}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Commercial Vehicle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-purple-900 font-mono bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {v.registrationNumber}
                      </span>
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                        Available
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 mt-1">
                      {v.modelName || v.model || 'Commercial Vehicle'}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>
                        <strong className="text-gray-700">Type:</strong> {v.vehicleType}
                      </p>
                      <p>
                        <strong className="text-gray-700">Max Capacity:</strong>{' '}
                        <span className="font-semibold text-emerald-700">{v.maxCapacityKg} kg</span>
                      </p>
                      {v.driverName && (
                        <p>
                          <strong className="text-gray-700">Assigned Driver:</strong> {v.driverName}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-[11px]">
                      {v.photoUrl && (
                        <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> Vehicle Photo
                        </span>
                      )}
                      {v.numberPlatePhotoUrl && (
                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> Number Plate
                        </span>
                      )}
                      {v.rcDocUrl && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> RC Document
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditVehicleModal(v)}
                      className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Deactivate vehicle "${v.registrationNumber}"? Historical records will be preserved.`)) {
                          await handleDeactivateVehicle(v._id);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DRIVERS TAB */}
      {/* ========================================================= */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fleet Drivers</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Authorized drivers who operate your commercial transport fleet and carry shipments.
              </p>
            </div>
            <Button
              onClick={openAddDriverModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Driver
            </Button>
          </div>

          {drivers.filter((d) => d.isActive).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Authorized Drivers Added</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                If you employ drivers for your vehicles, add their details with Aadhaar and Driving License documents for compliance.
              </p>
              <Button
                onClick={openAddDriverModal}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Driver
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drivers
                .filter((d) => d.isActive)
                .map((driver) => (
                  <div
                    key={driver._id}
                    className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wider">
                          AUTHORIZED DRIVER
                        </span>
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                          Active
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-gray-900 mt-1">{driver.name}</h4>

                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {driver.phone}
                        </p>
                        {driver.assignedVehicleNumber && (
                          <p>
                            <strong className="text-gray-700">Vehicle:</strong>{' '}
                            <span className="font-mono text-purple-700 font-semibold">
                              {driver.assignedVehicleNumber}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Aadhaar:</span>
                          <span className="font-mono font-semibold">
                            {driver.aadhaarNumber || 'Verified on file'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Driving License:</span>
                          <span className="font-mono font-semibold">
                            {driver.licenseNumber || 'Verified on file'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDriverModal(driver)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Deactivate driver "${driver.name}"? Historical trips will be preserved.`)) {
                            await handleDeactivateDriver(driver._id);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SAVED ROUTES TAB */}
      {/* ========================================================= */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Saved Travel & Corridor Routes</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Corridors connecting your saved pickup points, shops, and district depots.
              </p>
            </div>
            <Button
              onClick={openAddRouteModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Route
            </Button>
          </div>

          {routes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Saved Corridor Routes</h3>
              <p className="text-xs text-gray-500 mt-1">
                Define regular routes connecting your saved pickup and drop points for daily automated parcel match alerts.
              </p>
              <Button
                onClick={openAddRouteModal}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Route
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((r) => (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">{r.routeTitle}</h4>
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] capitalize">
                        {r.scheduledFrequency || 'Daily'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-700 my-2">
                      <span className="font-semibold text-emerald-800">
                        {r.sourceLocation?.villageOrCity || 'Origin'}
                      </span>
                      <span className="text-gray-400">➔</span>
                      <span className="font-semibold text-blue-800">
                        {r.destinationLocation?.villageOrCity || 'Destination'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Transport</span>
                        <span className="font-semibold text-gray-800">{r.vehicleType || 'Bike'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Capacity</span>
                        <span className="font-semibold text-gray-800">{r.capacityKg ? `${r.capacityKg} kg` : 'Standard'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Rate / kg</span>
                        <span className="font-semibold text-emerald-700">₹{r.pricePerKg ?? 0}/kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Departure: {r.departureTime || 'Flexible'}
                    </span>
                    <Button
                      onClick={openAddTripModal}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                    >
                      Create Trip →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TRIPS TAB (CONNECTING SAVED LOCATIONS) */}
      {/* ========================================================= */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Stop-by-Stop Trips</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Active and scheduled trips with stop manifests connecting saved pickup/drop locations and shops.
              </p>
            </div>
            <Button
              onClick={openAddTripModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Trip
            </Button>
          </div>

          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Trips Created Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Schedule a trip to accept multi-parcel deliveries along your route. Select saved pickup and drop points for each stop!
              </p>
              <Button
                onClick={openAddTripModal}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Trip
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {t.tripId}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{t.routeTitle}</h4>
                    </div>
                    <Badge
                      className={
                        t.tripStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.tripStatus === 'MOVING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {t.tripStatus}
                    </Badge>
                  </div>

                  <div className="py-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">START POINT</span>
                      <span className="font-bold text-gray-900">
                        {t.startLocation?.name || 'Origin'}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Dep: {t.departureTime || '08:30 AM'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-gray-400 block uppercase">STOPS & WAYPOINTS</span>
                      {t.stops && t.stops.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {t.stops.map((st, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                            >
                              {i + 1}. {st.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">Direct corridor route (0 intermediate stops)</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">DESTINATION</span>
                      <span className="font-bold text-gray-900">
                        {t.finalDestination?.name || 'Destination'}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Arr: {t.expectedArrival || '12:00 PM'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
                    <div className="flex items-center gap-3">
                      <span>Vehicle: <strong>{t.transportType}</strong></span>
                      <span>Capacity: <strong>{t.totalCapacityKg} kg</strong></span>
                      <span>Date: <strong>{t.travelDate || 'Today'}</strong></span>
                    </div>

                    {t.tripStatus === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleUpdateTripStatus(t._id, 'MOVING', t.startLocation?.name);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Start Trip Now
                      </Button>
                    )}
                    {t.tripStatus === 'MOVING' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleUpdateTripStatus(t._id, 'COMPLETED', t.finalDestination?.name);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                      >
                        Complete Trip
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. DOCUMENTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">KYC & Compliance Documents</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Government identity cards, RC records, driver licenses, and vehicle inspection photos.
              </p>
            </div>
            <Button
              onClick={() => setDocModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Upload Document
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Documents Uploaded</h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload your Aadhaar, PAN, vehicle RC, or driver documents for verification.
              </p>
              <Button
                onClick={() => setDocModalOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Upload Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                        {doc.documentType}
                      </span>
                      <Badge
                        className={
                          doc.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : doc.verificationStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }
                      >
                        {doc.verificationStatus}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-2 font-mono">
                      {doc.documentNumber}
                    </h4>

                    {doc.documentUrl && (
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 font-medium"
                      >
                        View Document <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                    Uploaded: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. EARNINGS TAB */}
      {/* ========================================================= */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-gray-200 shadow-xs bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                  Available Wallet Balance
                </span>
                <div className="text-2xl font-extrabold text-blue-900 font-mono mt-1">
                  ₹{partner?.walletBalance || 0}
                </div>
                <Button
                  onClick={() => setPayoutModalOpen(true)}
                  disabled={(partner?.walletBalance || 0) <= 0}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-xs">
              <CardContent className="pt-6">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Pending Payouts
                </span>
                <div className="text-2xl font-extrabold text-amber-800 font-mono mt-1">
                  ₹{partner?.pendingPayouts || 0}
                </div>
                <p className="text-xs text-gray-500 mt-2">Under automated bank processing</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-xs">
              <CardContent className="pt-6">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Total Lifetime Earnings
                </span>
                <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
                  ₹{stats?.totalEarnings || partner?.walletBalance || 0}
                </div>
                <p className="text-xs text-gray-500 mt-2">From verified parcel deliveries & trips</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT LOCATION (PICKUP / DROP) */}
      {/* ========================================================= */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingLocationId ? 'Edit Location' : `Add ${locDefaultType} Location`}
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Location Name *
                </label>
                <Input
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Darbhanga Main Shop / Sakri Hub Point"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Location Type *
                  </label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                  >
                    <option value="Shop">Shop</option>
                    <option value="Pickup Point">Pickup Point</option>
                    <option value="Drop Point">Drop Point</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Hub">Hub</option>
                    <option value="Office">Office</option>
                    <option value="Home">Home</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end gap-1.5 pb-1">
                  <span className="font-semibold text-gray-700">Capabilities</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locIsPickup}
                        onChange={(e) => setLocIsPickup(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      Pickup
                    </label>
                    <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locIsDrop}
                        onChange={(e) => setLocIsDrop(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      Drop
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Street Address *
                </label>
                <Input
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Door/Shop No., Street, Main Road"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Village / Town</label>
                  <Input
                    value={locVillage}
                    onChange={(e) => setLocVillage(e.target.value)}
                    placeholder="Village or Town"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">District *</label>
                  <Input
                    value={locDistrict}
                    onChange={(e) => setLocDistrict(e.target.value)}
                    placeholder="District"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Area / Panchayat</label>
                  <Input
                    value={locArea}
                    onChange={(e) => setLocArea(e.target.value)}
                    placeholder="Area"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Block</label>
                  <Input
                    value={locBlock}
                    onChange={(e) => setLocBlock(e.target.value)}
                    placeholder="Block"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN Code *</label>
                  <Input
                    value={locPinCode}
                    onChange={(e) => setLocPinCode(e.target.value)}
                    placeholder="PIN Code"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Landmark</label>
                <Input
                  value={locLandmark}
                  onChange={(e) => setLocLandmark(e.target.value)}
                  placeholder="Near Temple / Chowk / Petrol Pump"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Person Name
                  </label>
                  <Input
                    value={locContactPerson}
                    onChange={(e) => setLocContactPerson(e.target.value)}
                    placeholder="Person at location"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Mobile
                  </label>
                  <Input
                    value={locContactMobile}
                    onChange={(e) => setLocContactMobile(e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              {/* GPS Location Coordinates */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Map / GPS Coordinates</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectLocationGps}
                    disabled={locDetectingGps}
                    className="text-[11px] font-bold text-blue-700 border-blue-200 hover:bg-blue-50 py-1 h-auto"
                  >
                    <Crosshair className="w-3 h-3 mr-1" />
                    {locDetectingGps ? 'Detecting...' : 'Use Current Location'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    placeholder="Latitude (e.g. 26.1523)"
                  />
                  <Input
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    placeholder="Longitude (e.g. 85.8974)"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={locSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {locSaving ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT SHOP / BUSINESS LOCATION */}
      {/* ========================================================= */}
      {shopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingShopId ? 'Edit Shop Location' : 'Add Shop / Business Location'}
              </h3>
              <button
                onClick={() => setShopModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveShop} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Shop / Business Name *
                  </label>
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. LocalHaat Point — Darbhanga"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Owner / Contact Person *
                  </label>
                  <Input
                    value={shopOwnerName}
                    onChange={(e) => setShopOwnerName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <Input
                    value={shopMobile}
                    onChange={(e) => setShopMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Shop Type *
                  </label>
                  <select
                    value={shopType}
                    onChange={(e) => setShopType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                  >
                    <option value="General Store">General Store</option>
                    <option value="Hardware Store">Hardware Store</option>
                    <option value="Grocery Store">Grocery Store</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Logistics Point">Logistics Point</option>
                    <option value="Collection Point">Collection Point</option>
                    <option value="Delivery Point">Delivery Point</option>
                    <option value="Local Business">Local Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Approx. Holding Capacity
                  </label>
                  <Input
                    value={shopHoldingCap}
                    onChange={(e) => setShopHoldingCap(e.target.value)}
                    placeholder="e.g. 100 Parcels / 500 kg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Street Address *
                </label>
                <Input
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Plot/Shop No., Road, Chowk"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Village / Town *</label>
                  <Input
                    value={shopVillage}
                    onChange={(e) => setShopVillage(e.target.value)}
                    placeholder="Village"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">District *</label>
                  <Input
                    value={shopDistrict}
                    onChange={(e) => setShopDistrict(e.target.value)}
                    placeholder="District"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN Code *</label>
                  <Input
                    value={shopPinCode}
                    onChange={(e) => setShopPinCode(e.target.value)}
                    placeholder="PIN Code"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Opening Time</label>
                  <Input
                    value={shopOpenTime}
                    onChange={(e) => setShopOpenTime(e.target.value)}
                    placeholder="08:00 AM"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Closing Time</label>
                  <Input
                    value={shopCloseTime}
                    onChange={(e) => setShopCloseTime(e.target.value)}
                    placeholder="08:00 PM"
                  />
                </div>
              </div>

              {/* Service Capabilities */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <span className="font-semibold text-indigo-900 block">Available Logistics Services</span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={shopPickupAvail}
                      onChange={(e) => setShopPickupAvail(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    ✓ Pickup Available
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={shopDropAvail}
                      onChange={(e) => setShopDropAvail(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    ✓ Drop Available
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={shopHoldingAvail}
                      onChange={(e) => setShopHoldingAvail(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    ✓ Parcel Holding Available
                  </label>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Map / GPS Coordinates</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectShopGps}
                    disabled={shopDetectingGps}
                    className="text-[11px] font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50 py-1 h-auto"
                  >
                    <Crosshair className="w-3 h-3 mr-1" />
                    {shopDetectingGps ? 'Detecting...' : 'Use Current Location'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={shopLat}
                    onChange={(e) => setShopLat(e.target.value)}
                    placeholder="Latitude"
                  />
                  <Input
                    value={shopLng}
                    onChange={(e) => setShopLng(e.target.value)}
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShopModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={shopSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {shopSaving ? 'Saving...' : 'Save Shop Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT VEHICLE */}
      {/* ========================================================= */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingVehicleId ? 'Edit Vehicle' : 'Register Commercial Vehicle'}
              </h3>
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveVehicle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Commercial Vehicle Type *
                </label>
                <select
                  value={vehType}
                  onChange={(e) => setVehType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  <option value="Pickup (Tata Ace / Bolero Maxi)">Pickup (Tata Ace / Bolero Maxi)</option>
                  <option value="Bus (Regional / Inter-District)">Bus (Regional / Inter-District)</option>
                  <option value="Auto Cargo (3-Wheeler Tempo)">Auto Cargo (3-Wheeler Tempo)</option>
                  <option value="E-Rickshaw Cargo / Toto">E-Rickshaw Cargo / Toto</option>
                  <option value="Tractor Trolley">Tractor Trolley</option>
                  <option value="Delivery Van / Maruti Eeco">Delivery Van / Maruti Eeco</option>
                  <option value="Mini Truck (Tata 407 / 6-Wheeler)">Mini Truck (Tata 407 / 6-Wheeler)</option>
                  <option value="Heavy Commercial Truck (10+ Wheeler)">Heavy Commercial Truck (10+ Wheeler)</option>
                  <option value="Motorcycle / Two-Wheeler">Motorcycle / Two-Wheeler</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Registration Number *
                  </label>
                  <Input
                    value={vehRegNum}
                    onChange={(e) => setVehRegNum(e.target.value.toUpperCase())}
                    placeholder="e.g. BR-07-G-1234"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Model Name *
                  </label>
                  <Input
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    placeholder="e.g. Tata Ace Gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Max Load Capacity (kg) *
                  </label>
                  <Input
                    type="number"
                    value={vehCapacityKg}
                    onChange={(e) => setVehCapacityKg(e.target.value)}
                    placeholder="e.g. 750"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Assign Authorized Driver
                  </label>
                  <select
                    value={vehAssignedDriverId}
                    onChange={(e) => setVehAssignedDriverId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                  >
                    <option value="">Owner Drives (Self)</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Vehicle Photo URL / Upload
                </label>
                <Input
                  value={vehPhotoUrl}
                  onChange={(e) => setVehPhotoUrl(e.target.value)}
                  placeholder="https://... or /uploads/vehicle.jpg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Number Plate Photo URL / Upload
                </label>
                <Input
                  value={vehPlatePhotoUrl}
                  onChange={(e) => setVehPlatePhotoUrl(e.target.value)}
                  placeholder="https://... or /uploads/plate.jpg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  RC Document URL / Upload
                </label>
                <Input
                  value={vehRcDocUrl}
                  onChange={(e) => setVehRcDocUrl(e.target.value)}
                  placeholder="https://... or /uploads/rc.pdf"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setVehicleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={vehSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {vehSaving ? 'Saving...' : 'Save Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT DRIVER */}
      {/* ========================================================= */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingDriverId ? 'Edit Driver' : 'Add Authorized Fleet Driver'}
              </h3>
              <button
                onClick={() => setDriverModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveDriver} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Driver Full Name *
                  </label>
                  <Input
                    value={drvName}
                    onChange={(e) => setDrvName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Mobile Phone *
                  </label>
                  <Input
                    value={drvPhone}
                    onChange={(e) => setDrvPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Aadhaar Card Number
                  </label>
                  <Input
                    value={drvAadhaar}
                    onChange={(e) => setDrvAadhaar(e.target.value)}
                    placeholder="12-digit Aadhaar"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Aadhaar Document URL
                  </label>
                  <Input
                    value={drvAadhaarDocUrl}
                    onChange={(e) => setDrvAadhaarDocUrl(e.target.value)}
                    placeholder="Document URL / upload"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Driving License Number
                  </label>
                  <Input
                    value={drvLicense}
                    onChange={(e) => setDrvLicense(e.target.value)}
                    placeholder="DL Number"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    License Document URL
                  </label>
                  <Input
                    value={drvLicenseDocUrl}
                    onChange={(e) => setDrvLicenseDocUrl(e.target.value)}
                    placeholder="Document URL / upload"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assign to Registered Vehicle
                </label>
                <select
                  value={drvAssignedVehId}
                  onChange={(e) => setDrvAssignedVehId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  <option value="">None / Flexible Pool</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.modelName || v.vehicleType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDriverModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={drvSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {drvSaving ? 'Saving...' : 'Save Driver'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD ROUTE (CONNECTING SAVED LOCATIONS) */}
      {/* ========================================================= */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Publish Corridor Route</h3>
              <button
                onClick={() => setRouteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Route Title</label>
                <Input
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  placeholder="e.g. Darbhanga Main Shop to Madhubani Regular Corridor"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Start / Origin Point (Select Saved Location or Shop) *
                </label>
                <select
                  value={routeSrcId}
                  onChange={(e) => setRouteSrcId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  {allSelectablePoints.length === 0 ? (
                    <option value="">No saved locations - please add a location first</option>
                  ) : (
                    allSelectablePoints.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Destination Point (Select Saved Location or Shop) *
                </label>
                <select
                  value={routeDstId}
                  onChange={(e) => setRouteDstId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  {allSelectablePoints.length === 0 ? (
                    <option value="">No saved locations - please add a location first</option>
                  ) : (
                    allSelectablePoints.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Frequency</label>
                  <select
                    value={routeFrequency}
                    onChange={(e) => setRouteFrequency(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="alternate_days">Alternate Days</option>
                    <option value="weekly">Weekly</option>
                    <option value="on_demand">On Demand</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Departure Time</label>
                  <Input
                    value={routeDepTime}
                    onChange={(e) => setRouteDepTime(e.target.value)}
                    placeholder="08:00 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transport</label>
                  <Input
                    value={routeVehType}
                    onChange={(e) => setRouteVehType(e.target.value)}
                    placeholder="Pickup / Bus"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Capacity (kg)</label>
                  <Input
                    type="number"
                    value={routeCapKg}
                    onChange={(e) => setRouteCapKg(e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rate (₹/kg)</label>
                  <Input
                    type="number"
                    value={routePriceKg}
                    onChange={(e) => setRoutePriceKg(e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRouteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={routeSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {routeSaving ? 'Publishing...' : 'Publish Corridor Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: CREATE TRIP (CONNECTING SAVED LOCATIONS & STOPS) */}
      {/* ========================================================= */}
      {tripModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Create Stop-by-Stop Trip</h3>
                <p className="text-[11px] text-gray-500">
                  Connect your saved pickup/drop points and shops into a single scheduled manifest.
                </p>
              </div>
              <button
                onClick={() => setTripModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveTrip} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trip Name / Note</label>
                <Input
                  value={tripRouteTitle}
                  onChange={(e) => setTripRouteTitle(e.target.value)}
                  placeholder="e.g. Morning Haat Dispatch"
                />
              </div>

              {/* Start Point */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <label className="block font-bold text-emerald-900 mb-1">
                  START LOCATION (Select Saved Pickup Point or Shop) *
                </label>
                <select
                  value={tripStartLocId}
                  onChange={(e) => setTripStartLocId(e.target.value)}
                  className="w-full rounded-md border border-emerald-300 p-2 text-xs font-medium bg-white"
                >
                  {allSelectablePoints.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intermediate Stops */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Intermediate Stops & Waypoints</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTripStop}
                    className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 py-1 h-auto"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Stop
                  </Button>
                </div>

                {tripStops.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">
                    No intermediate stops added (direct point-to-point trip). Click [+ Add Stop] to include waypoints.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tripStops.map((st, idx) => (
                      <div
                        key={st.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <select
                          value={st.stopLocationId}
                          onChange={(e) => updateTripStop(idx, e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 p-1.5 text-xs font-medium bg-white"
                        >
                          {allSelectablePoints.map((pt) => (
                            <option key={pt.id} value={pt.id}>
                              {pt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeTripStop(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Final Destination */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="block font-bold text-blue-900 mb-1">
                  FINAL DESTINATION (Select Saved Drop Point or Shop) *
                </label>
                <select
                  value={tripEndLocId}
                  onChange={(e) => setTripEndLocId(e.target.value)}
                  className="w-full rounded-md border border-blue-300 p-2 text-xs font-medium bg-white"
                >
                  {allSelectablePoints.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Select Commercial Vehicle
                  </label>
                  <select
                    value={tripVehicleId}
                    onChange={(e) => setTripVehicleId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                  >
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.vehicleType} - {v.maxCapacityKg} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Travel Date</label>
                  <Input
                    value={tripTravelDate}
                    onChange={(e) => setTripTravelDate(e.target.value)}
                    placeholder="Today or 2026-10-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Departure</label>
                  <Input
                    value={tripDepTime}
                    onChange={(e) => setTripDepTime(e.target.value)}
                    placeholder="08:30 AM"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expected Arrival</label>
                  <Input
                    value={tripArrTime}
                    onChange={(e) => setTripArrTime(e.target.value)}
                    placeholder="12:00 PM"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Capacity (kg)</label>
                  <Input
                    type="number"
                    value={tripCapKg}
                    onChange={(e) => setTripCapKg(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setTripModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={tripSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {tripSaving ? 'Scheduling...' : 'Schedule Trip'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: REQUEST PAYOUT */}
      {/* ========================================================= */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Request Earnings Payout</h3>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSavePayout} className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-900">
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  Available Balance
                </span>
                <span className="text-xl font-extrabold font-mono">
                  ₹{partner?.walletBalance || 0}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Payout Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Transfer Mode</label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                  <option value="UPI">Direct UPI Instant Transfer</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPayoutModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={payoutSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {payoutSaving ? 'Submitting...' : 'Confirm Withdrawal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: UPLOAD DOCUMENT */}
      {/* ========================================================= */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Upload Compliance Document</h3>
              <button onClick={() => setDocModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Type *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs font-medium"
                >
                  <option value="VEHICLE_RC">Vehicle RC Document</option>
                  <option value="VEHICLE_PHOTO">Vehicle Exterior Photo</option>
                  <option value="NUMBER_PLATE">High Security Number Plate Photo</option>
                  <option value="DRIVER_AADHAAR">Driver Aadhaar Card</option>
                  <option value="DRIVER_DRIVING_LICENSE">Driver Driving License</option>
                  <option value="AADHAAR">Owner Aadhaar Card</option>
                  <option value="PAN">Owner PAN Card</option>
                  <option value="DRIVING_LICENSE">Owner Driving License</option>
                  <option value="TRADE_LICENSE">Trade License</option>
                  <option value="GSTIN">GSTIN Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Document / Registration Number *
                </label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. BR-07-G-1234 or DL1234567"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  File URL / Hosted Document Path *
                </label>
                <Input
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://... or /uploads/document.pdf"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDocModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={docSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {docSaving ? 'Uploading...' : 'Submit Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
