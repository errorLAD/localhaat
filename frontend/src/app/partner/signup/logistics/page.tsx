'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { FileUploadInput } from '../../../../components/FileUploadInput';
import {
  Truck,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Car,
  Building,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Personal & Contact' },
  { id: 2, name: 'Identity & KYC' },
  { id: 3, name: 'Vehicle & Driver' },
  { id: 4, name: 'Bank & Payouts' },
  { id: 5, name: 'Routes & Areas' },
  { id: 6, name: 'Review & Submit' },
];

export default function ProfessionalLogisticsSignupPage() {
  const router = useRouter();
  const { signupLogisticsPartner, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submittedPartner, setSubmittedPartner] = useState<any | null>(null);

  // Step 1: Personal & Contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [pincode, setPincode] = useState('');

  // Step 2: Identity & KYC
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseDocUrl, setDrivingLicenseDocUrl] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panDocUrl, setPanDocUrl] = useState('');

  // Step 3: Vehicle & Driver
  const [transportType, setTransportType] = useState('Pickup');
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState('');
  const [vehicleRcDocUrl, setVehicleRcDocUrl] = useState('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState('');
  const [numberPlatePhotoUrl, setNumberPlatePhotoUrl] = useState('');
  const [isDriver, setIsDriver] = useState(true);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverAadhaarNumber, setDriverAadhaarNumber] = useState('');
  const [driverAadhaarDocUrl, setDriverAadhaarDocUrl] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [driverLicenseDocUrl, setDriverLicenseDocUrl] = useState('');
  const [maxCapacityKg, setMaxCapacityKg] = useState('1200');

  // Step 4: Bank Details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 5: Routes & Areas
  const [primaryHub, setPrimaryHub] = useState('Patna Rural Distribution Hub');
  const [serviceAreas, setServiceAreas] = useState('Patna, Vaishali, Hajipur');
  const [routeFrequency, setRouteFrequency] = useState('daily');

  // Step 6: Agreement
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Navigation handlers
  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      const clean = phone.replace(/\D/g, '').slice(-10);
      if (clean.length < 10) {
        setError('Please enter a valid 10-digit mobile phone number.');
        return false;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (!village.trim() || !pincode.trim()) {
        setError('Please provide your village/town and postal pincode.');
        return false;
      }
    } else if (step === 2) {
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        setError('Please enter a valid 12-digit Aadhaar number.');
        return false;
      }
      if (!drivingLicenseNumber.trim()) {
        setError('Driving License number is required for logistics partner onboarding.');
        return false;
      }
    } else if (step === 3) {
      if (!vehicleRegistrationNumber.trim()) {
        setError('Vehicle registration number is required (e.g. BR-01-AB-1234).');
        return false;
      }
      if (!isDriver) {
        if (!driverName.trim() || !driverPhone.trim()) {
          setError('Please enter the designated driver’s full name and contact number.');
          return false;
        }
        const cleanDrvAadhaar = driverAadhaarNumber.replace(/\D/g, '');
        if (driverAadhaarNumber && cleanDrvAadhaar.length !== 12) {
          setError('Driver’s Aadhaar number must be exactly 12 digits.');
          return false;
        }
        if (!driverLicenseNumber.trim()) {
          setError('Driver’s Driving License (DL) number is required.');
          return false;
        }
      }
    } else if (step === 4) {
      if (!accountNumber.trim() && !upiId.trim()) {
        setError('Please enter either Bank Account details or a valid UPI ID for freight payouts.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    if (!agreeTerms) {
      setError('You must agree to the Carrier Terms and Verification Policy to proceed.');
      return;
    }

    try {
      const areasList = serviceAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await signupLogisticsPartner({
        name: name.trim(),
        phone: phone.replace(/\D/g, '').slice(-10),
        email: email.trim() || undefined,
        password,
        profilePhotoUrl,
        address: {
          addressLine: village,
          village: village.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
        aadhaarDocUrl,
        panNumber: panNumber.trim() || undefined,
        panDocUrl,
        drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
        drivingLicenseDocUrl,
        transportType,
        vehicleRegistrationNumber: vehicleRegistrationNumber.trim().toUpperCase(),
        vehicleRcDocUrl,
        vehiclePhotoUrl,
        numberPlatePhotoUrl,
        isDriver,
        driverName: isDriver ? name : driverName,
        driverPhone: isDriver ? phone : driverPhone,
        driverAadhaarNumber: isDriver ? aadhaarNumber.replace(/\D/g, '') : driverAadhaarNumber.replace(/\D/g, ''),
        driverAadhaarDocUrl: isDriver ? aadhaarDocUrl : driverAadhaarDocUrl,
        driverLicenseNumber: isDriver ? drivingLicenseNumber.trim().toUpperCase() : driverLicenseNumber.trim().toUpperCase(),
        driverLicenseDocUrl: isDriver ? drivingLicenseDocUrl : driverLicenseDocUrl,
        maxCapacityKg: Number(maxCapacityKg) || 1200,
        bankDetails: {
          accountHolderName: accountHolderName || name,
          bankName,
          accountNumber,
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim(),
        },
        primaryHub,
        serviceAreas: areasList.length > 0 ? areasList : [district],
        routeFrequency,
      });

      setSubmittedPartner(res.partner || res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details and try again.');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedPartner) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-emerald-50/20 py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Verification Status: PENDING_VERIFICATION
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Logistics Application Received!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your Professional Logistics Partner registration has been registered in the LocalHaat logistics directory.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Partner ID:</span>
              <span className="font-mono font-bold text-gray-900">
                {submittedPartner.partnerCode || 'LP-' + Math.floor(1000 + Math.random() * 9000)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Registered Vehicle:</span>
              <span className="font-mono font-bold text-gray-900">
                {vehicleRegistrationNumber.toUpperCase()} ({transportType})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Carrier Desk SLA:</span>
              <span className="font-semibold text-emerald-800">24–48 Business Hours</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 font-medium">Platform Oversight:</span>
              <span className="font-semibold text-gray-700">InfraBlue Material Technologies Pvt Ltd</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-left bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 flex items-start gap-2">
            <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <span>
              You may now log into your partner dashboard to view pending documents, check dispatch notifications, and configure vehicle availability.
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/partner/dashboard')}
              className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-bold h-11 text-xs"
            >
              Open Partner Dashboard
            </Button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-xs"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-emerald-50/20 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <Truck className="w-4 h-4 text-emerald-700" />
            Professional Logistics Partner Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Register Your Commercial Transport Fleet
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">
            Operate regular inter-village routes, carry bulk haat consignments & earn steady weekly freight payouts
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center flex-1 text-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.id
                      ? 'bg-primary-700 text-white ring-4 ring-primary-100'
                      : currentStep > s.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > s.id ? '✓' : s.id}
                </div>
                <span
                  className={`text-[10px] mt-1 hidden sm:block ${
                    currentStep === s.id
                      ? 'font-bold text-primary-800'
                      : 'text-gray-500'
                  }`}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary-700 h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="shadow-lg border-gray-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Please enter authentic details as per your official registration and driving records.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* STEP 1: Personal & Contact */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Partner Full Name (As per Aadhaar/PAN) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <Input
                      type="text"
                      placeholder="e.g. Balwant Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Primary Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs text-gray-500 font-bold">+91</span>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-12 h-11 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <Input
                        type="email"
                        placeholder="fleet@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Portal Account Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 text-sm"
                    required
                  />
                </div>

                {/* Profile Photo */}
                <FileUploadInput
                  label="Partner Profile Selfie / Photo"
                  sublabel="Clear portrait photo of yourself"
                  accept="image/*"
                  value={profilePhotoUrl}
                  onChange={setProfilePhotoUrl}
                  isSelfie={true}
                  helperText="Required for partner identity badge during cargo handovers."
                />

                {/* Address */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Base Station Address
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Village / Town / Mohalla <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Ramnagar / Hajipur Haat"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-primary-700 focus:outline-none"
                      >
                        <option value="Patna">Patna</option>
                        <option value="Vaishali">Vaishali</option>
                        <option value="Muzaffarpur">Muzaffarpur</option>
                        <option value="Gaya">Gaya</option>
                        <option value="Bhagalpur">Bhagalpur</option>
                        <option value="Darbhanga">Darbhanga</option>
                        <option value="Samastipur">Samastipur</option>
                        <option value="Saran">Saran</option>
                        <option value="Nalanda">Nalanda</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                      <Input
                        type="text"
                        value={state}
                        readOnly
                        className="h-10 text-xs bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. 844101"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="h-10 text-sm font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Identity & KYC */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012"
                    value={aadhaarNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setAadhaarNumber(clean);
                    }}
                    className="h-11 text-sm font-mono tracking-widest"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Preview: {aadhaarNumber.length >= 4 ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-XXXX'} (Stored with secure platform encryption)
                  </p>
                </div>

                <FileUploadInput
                  label="Aadhaar Card Copy (Front & Back)"
                  sublabel="PDF or JPG image of your Aadhaar"
                  value={aadhaarDocUrl}
                  onChange={setAadhaarDocUrl}
                  helperText="Required for identity verification by LocalHaat Operations desk."
                />

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Driving License (DL) Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. BR-0120220012345"
                    value={drivingLicenseNumber}
                    onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                    className="h-11 text-sm font-mono uppercase"
                    required
                  />
                </div>

                <FileUploadInput
                  label="Driving License Document Upload"
                  sublabel="Clear photo of your active Driving License"
                  value={drivingLicenseDocUrl}
                  onChange={setDrivingLicenseDocUrl}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      PAN Card Number (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                      className="h-10 text-sm font-mono uppercase"
                    />
                  </div>
                  <div>
                    <FileUploadInput
                      label="PAN Card Document (Optional)"
                      value={panDocUrl}
                      onChange={setPanDocUrl}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Vehicle & Driver */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Commercial Transport Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-700 focus:outline-none"
                  >
                    <option value="Pickup">🚚 Pickup Truck (Tata Ace / Mahindra Bolero Maxi / Ashok Leyland Dost)</option>
                    <option value="Bus">🚌 Passenger & Cargo Bus (Regional / Inter-District Haat Service)</option>
                    <option value="Auto">🛺 Auto Rickshaw Cargo (3-Wheeler Tempo / Ape / Piaggio)</option>
                    <option value="E-Rickshaw">🛺 E-Rickshaw Cargo / Toto / Electric Loader</option>
                    <option value="Van">🚐 Delivery Van / Maruti Eeco Cargo</option>
                    <option value="Tractor">🚜 Tractor Trolley (Rural Agri Produce & Haat Transport)</option>
                    <option value="Mini-Truck">🚛 Mini Truck (Tata 407 / Eicher Pro / 6-Wheeler)</option>
                    <option value="Heavy-Truck">🚛 Heavy Commercial Truck (10+ Wheeler / Multi-Axle Freight)</option>
                    <option value="Bike">🏍️ Motorcycle / Heavy Two-Wheeler with Commercial Carrier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Registration Number (RTO) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. BR-01-AB-1234"
                    value={vehicleRegistrationNumber}
                    onChange={(e) => setVehicleRegistrationNumber(e.target.value.toUpperCase())}
                    className="h-11 text-base font-mono font-bold uppercase tracking-wider"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Must match the vehicle Registration Certificate (RC) issued by Transport Dept.
                  </p>
                </div>

                <FileUploadInput
                  label="Vehicle RC (Registration Certificate) Document"
                  sublabel="Clear photo or PDF of the Vehicle RC"
                  value={vehicleRcDocUrl}
                  onChange={setVehicleRcDocUrl}
                  helperText="Required for commercial fleet verification."
                />

                {/* Vehicle Photo & Number Plate Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <FileUploadInput
                    label="Vehicle Photo"
                    sublabel="Clear photo showing front & full body of vehicle"
                    value={vehiclePhotoUrl}
                    onChange={setVehiclePhotoUrl}
                    helperText="Helps verify transport body type and capacity."
                  />
                  <FileUploadInput
                    label="Number Plate Photo"
                    sublabel="Clear close-up photo of the registration number plate"
                    value={numberPlatePhotoUrl}
                    onChange={setNumberPlatePhotoUrl}
                    helperText="Must clearly show the registration number."
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Maximum Rated Load Capacity (in kg)
                  </label>
                  <select
                    value={maxCapacityKg}
                    onChange={(e) => setMaxCapacityKg(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-primary-700 focus:outline-none"
                  >
                    <option value="25">25 kg (Two-Wheeler / Bike Carrier)</option>
                    <option value="150">150 kg (E-Rickshaw Cargo / E-Loader)</option>
                    <option value="350">350 kg (Auto Rickshaw Cargo / 3-Wheeler Tempo)</option>
                    <option value="600">600 kg (Small Van / Maruti Eeco Cargo)</option>
                    <option value="1200">1,200 kg (Tata Ace / Mahindra Bolero Maxi Truck)</option>
                    <option value="2500">2,500 kg (Pickup / Mini Truck 407)</option>
                    <option value="5000">5,000 kg (Regional Bus Cargo Boot & Rooftop / 6-Wheeler)</option>
                    <option value="10000">10,000+ kg (Heavy Multi-Axle Commercial Freight Truck)</option>
                  </select>
                </div>

                {/* "Are you the driver?" toggle */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Are you the primary driver?</div>
                      <div className="text-[11px] text-gray-500">
                        Will you drive the vehicle yourself, or do you have an assigned driver?
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name="isDriver"
                          checked={isDriver}
                          onChange={() => setIsDriver(true)}
                          className="text-primary-700 focus:ring-primary-700"
                        />
                        Yes, I drive
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name="isDriver"
                          checked={!isDriver}
                          onChange={() => setIsDriver(false)}
                          className="text-primary-700 focus:ring-primary-700"
                        />
                        No, hired driver
                      </label>
                    </div>
                  </div>

                  {!isDriver && (
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                      <div className="text-xs font-bold text-emerald-900">
                        Designated Driver Information & Verification Documents
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Driver Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Mukesh Yadav"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            className="h-10 text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Driver Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            value={driverPhone}
                            onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="h-10 text-xs"
                            required
                          />
                        </div>
                      </div>

                      {/* Driver Aadhaar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Driver Aadhaar Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="12-digit Aadhaar number"
                            value={driverAadhaarNumber}
                            onChange={(e) => setDriverAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            className="h-10 text-xs font-mono"
                            required
                          />
                        </div>
                        <div>
                          <FileUploadInput
                            label="Driver Aadhaar Card (Front/Back)"
                            sublabel="Upload photo of driver's Aadhaar card"
                            value={driverAadhaarDocUrl}
                            onChange={setDriverAadhaarDocUrl}
                          />
                        </div>
                      </div>

                      {/* Driver Driving License */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Driver Driving License (DL) Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. BR-0120220012345"
                            value={driverLicenseNumber}
                            onChange={(e) => setDriverLicenseNumber(e.target.value.toUpperCase())}
                            className="h-10 text-xs font-mono uppercase"
                            required
                          />
                        </div>
                        <div>
                          <FileUploadInput
                            label="Driver Driving License Document"
                            sublabel="Upload photo of driver's Driving License"
                            value={driverLicenseDocUrl}
                            onChange={setDriverLicenseDocUrl}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Bank & Payouts */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Freight commissions and per-km delivery fees are calculated daily and settled weekly directly to your registered bank account or UPI ID.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    UPI ID (For Fast Daily Micro-Payouts)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. partner@okhdfcbank or 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-11 text-sm font-mono"
                  />
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 font-semibold uppercase">Or Direct Bank Details</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Name as printed in bank passbook"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="h-10 text-sm font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Account Number
                  </label>
                  <Input
                    type="text"
                    placeholder="Bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Routes & Service Areas */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Base Station / Dispatch Hub
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Patna Central Hub or Hajipur Haat"
                    value={primaryHub}
                    onChange={(e) => setPrimaryHub(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Operational Service Districts / Towns (Comma separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Patna, Vaishali, Hajipur, Sonapur"
                    value={serviceAreas}
                    onChange={(e) => setServiceAreas(e.target.value)}
                    className="h-11 text-sm"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Enter the towns and haats your vehicle regularly services.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Operating Schedule & Frequency
                  </label>
                  <select
                    value={routeFrequency}
                    onChange={(e) => setRouteFrequency(e.target.value)}
                    className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-700 focus:outline-none"
                  >
                    <option value="daily">Daily Scheduled Haat Runs (Mon-Sun)</option>
                    <option value="alternate_days">Alternate Days (3–4 days/week)</option>
                    <option value="weekly">Weekly Haat Days Only</option>
                    <option value="on_demand">On-Demand Bulk Cargo Dispatches</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                    <span>Summary of Application</span>
                    <span className="text-primary-700 font-normal">Check before submission</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Partner Name:</span>{' '}
                      <strong className="text-gray-800">{name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <strong className="text-gray-800 font-mono">+91 {phone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicle:</span>{' '}
                      <strong className="text-gray-800">{vehicleRegistrationNumber} ({transportType})</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Capacity:</span>{' '}
                      <strong className="text-gray-800">{maxCapacityKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Primary Hub:</span>{' '}
                      <strong className="text-gray-800">{primaryHub}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Aadhaar (Masked):</span>{' '}
                      <strong className="text-gray-800 font-mono">XXXX-XXXX-{aadhaarNumber.slice(-4)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Driving License:</span>{' '}
                      <strong className="text-gray-800 font-mono">{drivingLicenseNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Payout Target:</span>{' '}
                      <strong className="text-gray-800">{upiId || accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicle Photos:</span>{' '}
                      <strong className="text-gray-800">
                        {vehiclePhotoUrl ? 'Photo Uploaded ✓' : 'Omitted'} • {numberPlatePhotoUrl ? 'Plate Uploaded ✓' : 'Omitted'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Driver Assigned:</span>{' '}
                      <strong className="text-gray-800">
                        {isDriver ? 'Self-Driven (Owner DL/Aadhaar)' : `Hired: ${driverName} (DL: ${driverLicenseNumber})`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-primary-700 focus:ring-primary-700 h-4 w-4"
                    />
                    <span>
                      I declare that all submitted personal, vehicle registration, and driver details are valid and accurate under the Motor Vehicles Act. I agree to adhere to the{' '}
                      <Link href="/terms" target="_blank" className="text-primary-700 underline font-semibold">
                        LocalHaat Carrier Terms of Service
                      </Link>
                      , cargo safety guidelines, and verification rules managed by InfraBlue Material Technologies Private Limited.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 mt-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="inline-flex items-center gap-1.5 text-xs h-10 border-gray-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
              ) : (
                <Link
                  href="/partner/signup"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Selection
                </Link>
              )}

              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-1.5 text-xs h-10 bg-primary-700 hover:bg-primary-800 text-white font-bold"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 shadow-sm"
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Logistics Registration'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
