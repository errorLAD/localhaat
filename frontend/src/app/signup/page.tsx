'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import {
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Truck,
  Store,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function CustomerSignupPage() {
  const router = useRouter();
  const { signupCustomer, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address fields
  const [village, setVillage] = useState('');
  const [panchayat, setPanchayat] = useState('');
  const [district, setDistrict] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [pincode, setPincode] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!village.trim() || !pincode.trim()) {
      setError('Please provide your village/town and postal pincode.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    try {
      await signupCustomer({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        address: {
          addressLine: panchayat ? `${panchayat}, ${village}` : village,
          village: village.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
      });

      // Redirect to customer dashboard
      router.push('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register account. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-emerald-50/20 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Your Customer Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-md mx-auto">
            Order fresh produce, artisan goods & send parcels across Bihar villages
          </p>
        </div>

        <Card className="shadow-lg border-gray-200/80 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">
              Customer Registration
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Quick registration with basic contact and delivery location details. No vehicle or ID documents required for customer accounts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <Input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    className="pl-10 h-11 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs text-gray-500 font-bold">
                      +91
                    </span>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        setError(null);
                      }}
                      className="pl-12 h-11 text-sm tracking-wide"
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
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="pl-10 h-11 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      className="h-11 text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    className="h-11 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  Your Primary Village / Delivery Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Village / Town <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Sonapur / Ramnagar"
                      value={village}
                      onChange={(e) => {
                        setVillage(e.target.value);
                        setError(null);
                      }}
                      className="h-10 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Gram Panchayat / Area (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Belaganj Panchayat"
                      value={panchayat}
                      onChange={(e) => setPanchayat(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <option value="Muzaffarpur">Muzaffarpur</option>
                      <option value="Bhagalpur">Bhagalpur</option>
                      <option value="Darbhanga">Darbhanga</option>
                      <option value="Purnia">Purnia</option>
                      <option value="Vaishali">Vaishali</option>
                      <option value="Samastipur">Samastipur</option>
                      <option value="Begusarai">Begusarai</option>
                      <option value="Nalanda">Nalanda</option>
                      <option value="Madhubani">Madhubani</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State
                    </label>
                    <Input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-10 text-xs bg-gray-50 text-gray-600"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 800001"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError(null);
                      }}
                      className="h-10 text-sm font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-primary-700 focus:ring-primary-700 h-4 w-4"
                  />
                  <span>
                    I agree to the LocalHaat{' '}
                    <Link href="/terms" target="_blank" className="text-primary-700 underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" className="text-primary-700 underline font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-bold bg-primary-700 hover:bg-primary-800 text-white shadow-sm"
              >
                {isLoading ? 'Creating Your Account...' : 'Complete Customer Signup'}
              </Button>

              <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
                Already registered with LocalHaat?{' '}
                <Link href="/login" className="font-bold text-primary-700 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Other Role Opportunities */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
            Looking for a Partner or Agent Role?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/partner/signup"
              className="p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-primary-800">
                    Logistics / Travelling Partner
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Earn by transporting parcels
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/agent/signup"
              className="p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-primary-800">
                    Village Drop Hub Agent
                  </div>
                  <div className="text-[11px] text-gray-500">
                    ₹25-30 commission per parcel
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
