'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { FileUploadInput } from '../../../components/FileUploadInput';
import {
  Store,
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
  Package,
  Layers,
  Banknote,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Personal & Contact' },
  { id: 2, name: 'Hub Location' },
  { id: 3, name: 'Identity & Shop' },
  { id: 4, name: 'Operating Capabilities' },
  { id: 5, name: 'Bank & Payouts' },
  { id: 6, name: 'Review & Submit' },
];

export default function VillageAgentSignupPage() {
  const router = useRouter();
  const { signupVillageAgent, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submittedAgent, setSubmittedAgent] = useState<any | null>(null);

  // Step 1: Personal
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family');

  // Step 2: Hub Location
  const [villageName, setVillageName] = useState('');
  const [panchayat, setPanchayat] = useState('');
  const [block, setBlock] = useState('');
  const [district, setDistrict] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [pincode, setPincode] = useState('');
  const [landmarkAddress, setLandmarkAddress] = useState('');
  const [servingVillages, setServingVillages] = useState('');

  // Step 3: Identity & Shop
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState('');
  const [shopDocUrl, setShopDocUrl] = useState('');

  // Step 4: Infrastructure & Capabilities
  const [hubEstablishmentType, setHubEstablishmentType] = useState('Kirana / Grocery Store');
  const [workingHours, setWorkingHours] = useState('07:00 AM - 08:00 PM');
  const [canReceive, setCanReceive] = useState(true);
  const [canDeliver, setCanDeliver] = useState(true);
  const [canHold, setCanHold] = useState(true);
  const [canCollectCash, setCanCollectCash] = useState(true);

  // Step 5: Bank Details
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 6: Agreement
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      const clean = phone.replace(/\D/g, '').slice(-10);
      if (clean.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
    } else if (step === 2) {
      if (!villageName.trim() || !landmarkAddress.trim() || !pincode.trim()) {
        setError('Please provide your village name, landmark address, and postal pincode.');
        return false;
      }
    } else if (step === 3) {
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        setError('Please enter a valid 12-digit Aadhaar number.');
        return false;
      }
    } else if (step === 4) {
      if (!workingHours.trim()) {
        setError('Please specify your daily operating hours.');
        return false;
      }
    } else if (step === 5) {
      if (!accountNumber.trim() && !upiId.trim()) {
        setError('Please provide bank details or UPI ID for commission payouts.');
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
      setError('You must agree to the Village Agent Hub Operating Guidelines to proceed.');
      return;
    }

    try {
      const villagesList = servingVillages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await signupVillageAgent({
        name: name.trim(),
        phone: phone.replace(/\D/g, '').slice(-10),
        email: email.trim() || undefined,
        password,
        profilePhotoUrl,
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.replace(/\D/g, '').slice(-10),
          relation: emergencyRelation,
        },
        villageName: villageName.trim(),
        panchayat: panchayat.trim(),
        block: block.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmarkAddress: landmarkAddress.trim(),
        servingVillages: villagesList.length > 0 ? villagesList : [villageName.trim()],
        aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
        aadhaarDocUrl,
        shopDocUrl,
        hubEstablishmentType,
        workingHours,
        capabilities: {
          canReceive,
          canDeliver,
          canHold,
          canCollectCash,
        },
        bankDetails: {
          accountHolder: accountHolder || name,
          bankName,
          accountNumber,
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim(),
        },
      });

      setSubmittedAgent(res.agent || res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details and try again.');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedAgent) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-emerald-50/20 py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Store className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Verification Status: PENDING_VERIFICATION
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Village Agent Hub Registered!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Congratulations! Your village hub has been entered into the LocalHaat Rural Hub Network under review.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Assigned Hub Code:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {submittedAgent.hubCode || 'VH-' + Math.floor(1000 + Math.random() * 9000)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Hub Village:</span>
              <span className="font-semibold text-gray-900">{villageName}, {district}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Base Commission:</span>
              <span className="font-semibold text-emerald-700">₹25 – ₹30 per parcel handled</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 font-medium">Payout Account:</span>
              <span className="font-mono font-bold text-gray-800">{upiId || accountNumber}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 text-left bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 flex items-start gap-2">
            <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <span>
              Our field operations team validates hub locations within 24 hours. You can access your Agent Dashboard to preview delivery manifests and configure hub hours.
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/agent/dashboard')}
              className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-bold h-11 text-xs"
            >
              Open Agent Dashboard
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
            <Store className="w-4 h-4 text-emerald-700" />
            Village Agent Hub Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Become an Authorized Village Drop & Pickup Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">
            Turn your kirana shop, CSC center or home into an official LocalHaat village point & earn ₹25–₹30 per parcel
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
                    currentStep === s.id ? 'font-bold text-primary-900' : 'text-gray-500'
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
              Local village hub agents coordinate parcel handovers and last-mile village collections.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* STEP 1: Personal & Contact */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Agent Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <Input
                      type="text"
                      placeholder="e.g. Sudhir Kumar"
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
                      Primary Mobile Phone <span className="text-red-500">*</span>
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
                        placeholder="agent@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hub Account Password <span className="text-red-500">*</span>
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

                <FileUploadInput
                  label="Agent Profile Selfie / Photo"
                  sublabel="Clear photo of the agent"
                  value={profilePhotoUrl}
                  onChange={setProfilePhotoUrl}
                  isSelfie={true}
                  helperText="Displayed in the customer app as the verified Village Hub Representative."
                />

                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-800">
                    Emergency Contact Person
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Brother / Spouse"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Relation</label>
                      <Input
                        type="text"
                        placeholder="e.g. Brother"
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Hub Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Village Name (Primary Location) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Sonapur"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      className="h-11 text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Gram Panchayat
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Belaganj Gram Panchayat"
                      value={panchayat}
                      onChange={(e) => setPanchayat(e.target.value)}
                      className="h-11 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Block / Taluka
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Belaganj Block"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="h-10 text-xs"
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
                      <option value="Gaya">Gaya</option>
                      <option value="Vaishali">Vaishali</option>
                      <option value="Muzaffarpur">Muzaffarpur</option>
                      <option value="Bhagalpur">Bhagalpur</option>
                      <option value="Darbhanga">Darbhanga</option>
                      <option value="Samastipur">Samastipur</option>
                      <option value="Nalanda">Nalanda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 804403"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-10 text-sm font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hub Exact Landmark & Address (Shop / Center) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Near Shiv Mandir, Main Chowk, Shop #4 (Sudhir Kirana)"
                    value={landmarkAddress}
                    onChange={(e) => setLandmarkAddress(e.target.value)}
                    className="h-11 text-sm"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    This address helps villagers and logistics transporters navigate directly to your drop point.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Additional Nearby Villages Served (Comma separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Belaganj, Rampur Tola, Mohanpur"
                    value={servingVillages}
                    onChange={(e) => setServingVillages(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Identity & Shop */}
            {currentStep === 3 && (
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
                    Preview: {aadhaarNumber.length >= 4 ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-XXXX'} (Stored encrypted)
                  </p>
                </div>

                <FileUploadInput
                  label="Aadhaar Card Document Copy"
                  sublabel="Clear photo or PDF of your Aadhaar card"
                  value={aadhaarDocUrl}
                  onChange={setAadhaarDocUrl}
                  helperText="Required for official authorization as a bonded Village Drop Hub."
                />

                <div className="pt-2 border-t border-gray-100">
                  <FileUploadInput
                    label="Shop / Center Proof or Electricity Bill (Optional)"
                    sublabel="Trade license, GSTIN, Shop board photo, or electricity bill"
                    value={shopDocUrl}
                    onChange={setShopDocUrl}
                    helperText="Helps expedite hub verification within 12 hours."
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Operating Capabilities */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hub Establishment Type
                  </label>
                  <select
                    value={hubEstablishmentType}
                    onChange={(e) => setHubEstablishmentType(e.target.value)}
                    className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-700 focus:outline-none"
                  >
                    <option value="Kirana / Grocery Store">🏪 Kirana / Grocery Store</option>
                    <option value="CSC / Common Service Center">💻 CSC / Digital Seva Kendra</option>
                    <option value="Telecom / Mobile Recharge Shop">📱 Telecom / Mobile Shop</option>
                    <option value="Dedicated Haat Point">🌾 Dedicated Haat Drop Point</option>
                    <option value="Residential Hub">🏠 Residential Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Daily Operating Hours <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 07:00 AM - 08:00 PM"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="h-11 text-sm"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    When is someone available at the hub to accept or dispatch parcels?
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-bold text-gray-800">
                    Hub Capabilities & Services Provided
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canReceive}
                        onChange={(e) => setCanReceive(e.target.checked)}
                        className="rounded text-primary-700 focus:ring-primary-700 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Package Receiving</div>
                        <div className="text-[11px] text-gray-500">
                          Receive arriving consignments from Logistics & Travelling Partners
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canDeliver}
                        onChange={(e) => setCanDeliver(e.target.checked)}
                        className="rounded text-primary-700 focus:ring-primary-700 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Customer Pickup Point & Village Drop</div>
                        <div className="text-[11px] text-gray-500">
                          Customers collect their orders here or deliver to nearby village homes
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canHold}
                        onChange={(e) => setCanHold(e.target.checked)}
                        className="rounded text-primary-700 focus:ring-primary-700 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Temporary Secure Parcel Storage</div>
                        <div className="text-[11px] text-gray-500">
                          Safely store parcels for up to 48 hours in a clean, dry location
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canCollectCash}
                        onChange={(e) => setCanCollectCash(e.target.checked)}
                        className="rounded text-primary-700 focus:ring-primary-700 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Cash on Delivery (COD) Handling</div>
                        <div className="text-[11px] text-gray-500">
                          Collect cash payments from villagers and deposit via UPI
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Bank & Payouts */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <Banknote className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Village Agents earn ₹25–₹30 commission per parcel handled. Commissions are compiled daily and deposited weekly directly to your bank account or UPI ID.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    UPI ID (Recommended)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. agent@okhdfcbank or 9876543210@paytm"
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
                    placeholder="Name in passbook"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
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
                      placeholder="e.g. Punjab National Bank"
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
                      placeholder="e.g. PUNB012345"
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
                    placeholder="Bank Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                    <span>Village Agent Summary</span>
                    <span className="text-primary-700 font-normal">Review before registration</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Agent Name:</span>{' '}
                      <strong className="text-gray-800">{name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Mobile Phone:</span>{' '}
                      <strong className="text-gray-800 font-mono">+91 {phone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Hub Village:</span>{' '}
                      <strong className="text-gray-800">{villageName}, {district}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Landmark:</span>{' '}
                      <strong className="text-gray-800">{landmarkAddress}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Establishment:</span>{' '}
                      <strong className="text-gray-800">{hubEstablishmentType}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span>{' '}
                      <strong className="text-gray-800">{workingHours}</strong>
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
                      className="mt-0.5 rounded border-gray-300 text-primary-700 focus:ring-primary-700 h-4 w-4"
                    />
                    <span>
                      I agree to serve as an authorized Village Drop Hub Agent for LocalHaat, comply with parcel custody procedures, and adhere to operational standards established by InfraBlue Material Technologies Private Limited.
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
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
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
                  {isLoading ? 'Submitting Registration...' : 'Complete Village Agent Registration'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
