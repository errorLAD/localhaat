'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../../context/BusinessContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  MapPin,
  Lock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function BusinessProfilePage() {
  const { user } = useAuth();
  const { business, pickupLocations, updateProfile, changePassword } = useBusiness();

  // Profile Form
  const [contactPerson, setContactPerson] = useState(business?.contactPerson || user?.name || '');
  const [contactEmail, setContactEmail] = useState(business?.contactEmail || user?.email || '');
  const [locations, setLocations] = useState<any[]>(
    pickupLocations && pickupLocations.length > 0
      ? pickupLocations
      : [
          {
            addressLine: business?.registeredAddress?.addressLine || 'Main Logistics Warehouse Hub, Plot 14',
            villageOrCity: business?.registeredAddress?.villageOrCity || 'Central Industrial Area',
            pincode: business?.registeredAddress?.pincode || '226001',
          },
        ]
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Location Form
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLoc, setNewLoc] = useState({
    addressLine: '',
    villageOrCity: '',
    pincode: '',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      const ok = await updateProfile({
        contactPerson,
        contactEmail,
        pickupLocations: locations,
      });
      if (ok) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        alert('Failed to update business profile.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.addressLine || !newLoc.villageOrCity) {
      alert('Address and City/Village are required.');
      return;
    }
    setLocations([...locations, newLoc]);
    setNewLoc({ addressLine: '', villageOrCity: '', pincode: '' });
    setShowAddLocation(false);
  };

  const handleRemoveLocation = (index: number) => {
    if (locations.length <= 1) {
      alert('At least one warehouse pickup location must be registered.');
      return;
    }
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const ok = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (ok) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError('Failed to change password. Please check your current password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Locations & Profile Management
          </h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Manage corporate credentials, warehouse pickup addresses for driver dispatches, and login security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Business & Contact Details
            </h3>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-[10px] font-bold">
              Corporate Account
            </Badge>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Logistics profile details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Business / Company Name</label>
              <Input
                disabled
                value={business?.businessName || user?.name || ''}
                className="rounded-xl h-10 text-xs bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
              />
              <span className="text-[10px] text-gray-400">Business name is verified by LocalHaat administration.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">GSTIN / Registration</label>
                <Input
                  disabled
                  value={business?.gstin || '09AAECR1234F1Z5'}
                  className="rounded-xl h-10 text-xs bg-gray-50 text-gray-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Account Username / Mobile</label>
                <Input
                  disabled
                  value={business?.contactPhone || user?.phone || ''}
                  className="rounded-xl h-10 text-xs bg-gray-50 text-gray-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Authorized Contact Person</label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Manager / Operations Lead"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Official Billing Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="billing@company.com"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={profileSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 h-10"
            >
              <Save className="w-3.5 h-3.5" />
              {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              Account Security & Password
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">B2B Portal Key</span>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">New Password</label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={passwordSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 h-10"
            >
              <Lock className="w-3.5 h-3.5" />
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>

      {/* Warehouse Pickup Locations Manager */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              Registered Warehouse Pickup Locations
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Drivers will be navigated to these locations when collecting your consignments and bulk pickup batches.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setShowAddLocation(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Pickup Facility
          </Button>
        </div>

        {/* Location List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span className="font-bold text-xs text-gray-900">
                    {loc.addressLine}
                  </span>
                </div>
                <p className="text-xs text-gray-500 pl-4">
                  {loc.villageOrCity} {loc.pincode ? `• PIN: ${loc.pincode}` : ''}
                </p>
                <div className="pl-4 pt-1">
                  <Badge variant="outline" className="text-[10px] bg-white text-purple-700 border-purple-200 font-semibold">
                    {idx === 0 ? 'Primary Hub' : 'Branch Warehouse'}
                  </Badge>
                </div>
              </div>

              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(idx)}
                  className="text-gray-400 hover:text-rose-600 p-1 transition"
                  title="Remove location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Location Subform */}
        {showAddLocation && (
          <form onSubmit={handleAddLocationSubmit} className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-purple-950">Add New Pickup Warehouse Facility</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                required
                placeholder="Address Line (Facility / Plot #)"
                value={newLoc.addressLine}
                onChange={(e) => setNewLoc({ ...newLoc, addressLine: e.target.value })}
                className="h-9 text-xs bg-white rounded-xl"
              />
              <Input
                required
                placeholder="Village / Industrial Area / City"
                value={newLoc.villageOrCity}
                onChange={(e) => setNewLoc({ ...newLoc, villageOrCity: e.target.value })}
                className="h-9 text-xs bg-white rounded-xl"
              />
              <Input
                placeholder="Postal Pincode"
                value={newLoc.pincode}
                onChange={(e) => setNewLoc({ ...newLoc, pincode: e.target.value })}
                className="h-9 text-xs bg-white rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold">
                Save Facility Location
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddLocation(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
