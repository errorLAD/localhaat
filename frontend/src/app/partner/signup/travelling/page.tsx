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
  Bike,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  Footprints,
  Bus,
  Train,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Commuter Profile' },
  { id: 2, name: 'Identity & KYC' },
  { id: 3, name: 'Transport Mode' },
  { id: 4, name: 'Routine Route' },
  { id: 5, name: 'Payout Details' },
  { id: 6, name: 'Review & Submit' },
];

const TRANSPORT_MODES = [
  { id: 'Walking', name: 'Walking / On Foot', icon: '🚶', isMotorized: false },
  { id: 'Bicycle', name: 'Bicycle / Cycle', icon: '🚲', isMotorized: false },
  { id: 'Bike', name: 'Motorcycle / Scooter', icon: '🏍️', isMotorized: true },
  { id: 'Car', name: 'Car / Personal Vehicle', icon: '🚗', isMotorized: true },
  { id: 'Shared Auto', name: 'Shared Auto / E-Rickshaw', icon: '🛺', isMotorized: false },
  { id: 'Bus', name: 'Bus Passenger', icon: '🚌', isMotorized: false },
  { id: 'Train', name: 'Train / Local Passenger', icon: '🚆', isMotorized: false },
  { id: 'Public Transport', name: 'Other Public Transport', icon: '🚐', isMotorized: false },
];

export default function TravellingPartnerSignupPage() {
  const router = useRouter();
  const { signupTravellingPartner, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submittedPartner, setSubmittedPartner] = useState<any | null>(null);

  // Step 1: Commuter Profile
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Patna');
  const [pincode, setPincode] = useState('');

  // Step 2: Identity & KYC
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState('');

  // Step 3: Transport Mode
  const [transportMode, setTransportMode] = useState('Bicycle');
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseDocUrl, setDrivingLicenseDocUrl] = useState('');

  // Step 4: Routine Route
  const [originVillage, setOriginVillage] = useState('');
  const [destinationTown, setDestinationTown] = useState('');
  const [frequentStops, setFrequentStops] = useState('');
  const [travelFrequency, setTravelFrequency] = useState('daily');
  const [departureTime, setDepartureTime] = useState('08:00 AM');
  const [parcelCapacityKg, setParcelCapacityKg] = useState('5');

  // Step 5: Payouts
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // Step 6: Agreement
  const [agreeTerms, setAgreeTerms] = useState(false);

  const selectedModeConfig = TRANSPORT_MODES.find((m) => m.id === transportMode);
  const isMotorized = selectedModeConfig?.isMotorized || false;

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
    } else if (step === 3) {
      if (isMotorized && !vehicleRegistrationNumber.trim()) {
        setError('Please enter your vehicle registration number.');
        return false;
      }
    } else if (step === 4) {
      if (!originVillage.trim() || !destinationTown.trim()) {
        setError('Please enter both your starting village and regular destination town.');
        return false;
      }
    } else if (step === 5) {
      if (!upiId.trim() && !accountNumber.trim()) {
        setError('Please provide your UPI ID or bank account details to receive parcel payouts.');
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
      setError('You must agree to the Travelling Partner Guidelines and Code of Conduct.');
      return;
    }

    try {
      const stopsList = frequentStops
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await signupTravellingPartner({
        name: name.trim(),
        phone: phone.replace(/\D/g, '').slice(-10),
        email: email.trim() || undefined,
        password,
        profilePhotoUrl,
        address: {
          addressLine: village,
          village: village.trim(),
          district: district.trim(),
          state: 'Bihar',
          pincode: pincode.trim(),
        },
        aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
        aadhaarDocUrl,
        transportMode,
        vehicleRegistrationNumber: isMotorized ? vehicleRegistrationNumber.trim().toUpperCase() : undefined,
        drivingLicenseNumber: isMotorized ? drivingLicenseNumber.trim().toUpperCase() : undefined,
        drivingLicenseDocUrl: isMotorized ? drivingLicenseDocUrl : undefined,
        originVillage: originVillage.trim(),
        destinationTown: destinationTown.trim(),
        frequentStops: stopsList,
        travelFrequency,
        departureTime,
        parcelCapacityKg: Number(parcelCapacityKg) || 5,
        bankDetails: {
          accountHolderName: accountHolderName || name,
          accountNumber,
          ifscCode: ifscCode.trim().toUpperCase(),
          bankName,
          upiId: upiId.trim(),
        },
      });

      setSubmittedPartner(res.partner || res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details and try again.');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedPartner) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-amber-50/30 py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Verification Status: PENDING_VERIFICATION
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Travelling Partner Application Received!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Welcome to LocalHaat! Your commuter route registration is being verified. You will soon receive parcel pickup notifications along your routine commute.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Commuter Partner ID:</span>
              <span className="font-mono font-bold text-gray-900">
                {submittedPartner.partnerCode || 'LP-TR-' + Math.floor(1000 + Math.random() * 9000)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Routine Route:</span>
              <span className="font-semibold text-gray-900">
                {originVillage} ↔ {destinationTown}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Transit Mode:</span>
              <span className="font-semibold text-emerald-800">
                {selectedModeConfig?.icon} {transportMode}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 font-medium">Payout Method:</span>
              <span className="font-mono font-bold text-gray-800">{upiId || accountNumber}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 text-left bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              Our village agent team will activate your route within 24 hours. Parcels matching your schedule (no minimum weight limit, from 2 grams up to 5 kg) will appear on your partner dashboard.
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/partner/dashboard')}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-xs"
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
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 via-amber-50/20 to-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-amber-700" />
            "Travels That Way Anyway" Commuter Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Carry Small Parcels on Your Daily Commute
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">
            Monetize your regular trips between villages and towns without commercial vehicle paperwork
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center flex-1 text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.id
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                      : currentStep > s.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > s.id ? '✓' : s.id}
                </div>
                <span
                  className={`text-[10px] mt-1 hidden sm:block ${
                    currentStep === s.id ? 'font-bold text-amber-900' : 'text-gray-500'
                  }`}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-300"
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
              Lightweight onboarding for commuters carrying parcels (no minimum weight limit, from 2 grams up to 5 kg) along their regular routes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* STEP 1: Commuter Profile */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <Input
                      type="text"
                      placeholder="e.g. Rameshwar Kumar"
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
                      Mobile Phone Number <span className="text-red-500">*</span>
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
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <Input
                        type="email"
                        placeholder="commuter@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Create your login password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 text-sm"
                    required
                  />
                </div>

                <FileUploadInput
                  label="Profile Selfie / Photo"
                  sublabel="Clear photo for identity verification"
                  value={profilePhotoUrl}
                  onChange={setProfilePhotoUrl}
                  isSelfie={true}
                  helperText="Helps village agents identify you when handing over parcels."
                />

                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    Home Location
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Home Village / Town <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Sonapur"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                      >
                        <option value="Patna">Patna</option>
                        <option value="Vaishali">Vaishali</option>
                        <option value="Muzaffarpur">Muzaffarpur</option>
                        <option value="Gaya">Gaya</option>
                        <option value="Bhagalpur">Bhagalpur</option>
                        <option value="Darbhanga">Darbhanga</option>
                        <option value="Samastipur">Samastipur</option>
                      </select>
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
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="h-11 text-sm font-mono tracking-widest"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Masked: {aadhaarNumber.length >= 4 ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-XXXX'} (Encrypted on secure server)
                  </p>
                </div>

                <FileUploadInput
                  label="Aadhaar or Voter ID Card Document Upload"
                  sublabel="Front/back photo or PDF of your government ID"
                  value={aadhaarDocUrl}
                  onChange={setAadhaarDocUrl}
                  helperText="Required for safe custody and verification of parcels handed to you."
                />
              </div>
            )}

            {/* STEP 3: Transport Mode */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    How do you typically travel along your routine route? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TRANSPORT_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setTransportMode(mode.id)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                          transportMode === mode.id
                            ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30 font-bold'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{mode.icon}</span>
                        <span className="text-xs">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONDITIONAL EXEMPTION DISPLAY */}
                {!isMotorized ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Commuter Exemption Verified: No Vehicle Registration or RC Required
                    </div>
                    <p className="text-emerald-700 leading-relaxed">
                      Since you travel via <strong>{transportMode}</strong>, you do not need commercial vehicle registration or RC papers! You will simply carry compact parcels (no minimum weight limit, from 2 grams up to 5 kg) in your backpack or travel bag and hand them over at destination village hubs.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                    <div className="text-xs font-bold text-amber-900">
                      Vehicle & License Details for {transportMode}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Vehicle Registration Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. BR-01-XX-1234"
                          value={vehicleRegistrationNumber}
                          onChange={(e) => setVehicleRegistrationNumber(e.target.value.toUpperCase())}
                          className="h-10 text-xs font-mono uppercase"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Driving License Number
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. BR-0120220012345"
                          value={drivingLicenseNumber}
                          onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                          className="h-10 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Routine Route */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Tell us where you travel regularly so our routing algorithm can assign small parcels directly matching your path!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Starting Village / Town (Origin) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Sonapur Village"
                      value={originVillage}
                      onChange={(e) => setOriginVillage(e.target.value)}
                      className="h-11 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Destination Town / Market (Haat) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Hajipur Haat"
                      value={destinationTown}
                      onChange={(e) => setDestinationTown(e.target.value)}
                      className="h-11 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Frequent Stops / Intermediate Villages on Way (Comma separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Belaganj, Ramnagar Chowk, Station Road"
                    value={frequentStops}
                    onChange={(e) => setFrequentStops(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Travel Frequency
                    </label>
                    <select
                      value={travelFrequency}
                      onChange={(e) => setTravelFrequency(e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    >
                      <option value="daily">Daily Commuter</option>
                      <option value="alternate_days">3–4 Days a Week</option>
                      <option value="weekly">Weekly Haat Days</option>
                      <option value="on_demand">Occasional Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Typical Departure Time
                    </label>
                    <select
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    >
                      <option value="07:00 AM">Morning (06:00 - 09:00 AM)</option>
                      <option value="11:00 AM">Mid-Day (10:00 AM - 01:00 PM)</option>
                      <option value="04:00 PM">Afternoon (02:00 - 05:00 PM)</option>
                      <option value="07:00 PM">Evening (06:00 - 09:00 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Small Parcel Capacity
                    </label>
                    <select
                      value={parcelCapacityKg}
                      onChange={(e) => setParcelCapacityKg(e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    >
                      <option value="2">Up to 2 kg (Hand carry)</option>
                      <option value="5">Up to 5 kg (Backpack / Bag)</option>
                      <option value="10">Up to 10 kg (Carrier bag)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Payout Details */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Get instant micro-payouts for every parcel successfully dropped at an authorized village hub or customer point.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    UPI ID (Recommended for Instant Payouts)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 9876543210@paytm or name@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-11 text-sm font-mono"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Compatible with GooglePay, PhonePe, Paytm, BHIM.
                  </p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 font-semibold uppercase">Or Bank Account</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Account Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Bank Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-10 text-sm font-mono"
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
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                    <span>Travelling Partner Summary</span>
                    <span className="text-amber-700 font-normal">Review before submitting</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Name:</span>{' '}
                      <strong className="text-gray-800">{name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <strong className="text-gray-800 font-mono">+91 {phone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Routine Route:</span>{' '}
                      <strong className="text-gray-800">{originVillage} ↔ {destinationTown}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Transit Mode:</span>{' '}
                      <strong className="text-gray-800">{transportMode}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Departure Time:</span>{' '}
                      <strong className="text-gray-800">{departureTime}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Parcel Size:</span>{' '}
                      <strong className="text-gray-800">{parcelCapacityKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Aadhaar:</span>{' '}
                      <strong className="text-gray-800 font-mono">XXXX-XXXX-{aadhaarNumber.slice(-4)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Payout Target:</span>{' '}
                      <strong className="text-gray-800">{upiId || accountNumber}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-600 h-4 w-4"
                    />
                    <span>
                      I confirm that I travel this route regularly and agree to safe parcel custody rules, prompt delivery at designated village hubs, and the{' '}
                      <Link href="/terms" target="_blank" className="text-amber-700 underline font-semibold">
                        LocalHaat Commuter Partner Code of Conduct
                      </Link>
                      .
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
                  className="inline-flex items-center gap-1.5 text-xs h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 shadow-sm"
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Travelling Partner Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
