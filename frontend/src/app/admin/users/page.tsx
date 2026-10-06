'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatDate } from '../../../lib/utils';
import {
  Users,
  Search,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function AdminUsersPage() {
  const { users, loadAdminData, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Platform Users Directory
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Global directory of all registered customers, transporters, village agents, business accounts, and operators.
          </p>
        </div>

        <Button
          onClick={() => loadAdminData()}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'customer', label: 'Customers' },
            { id: 'logistics_partner', label: 'Partners' },
            { id: 'village_agent', label: 'Agents' },
            { id: 'business', label: 'Businesses' },
            { id: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No platform users found matching this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Platform Role</th>
                  <th className="py-3 px-4">KYC Compliance</th>
                  <th className="py-3 px-4">Registered Location</th>
                  <th className="py-3 px-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      {u.email && <div className="text-[11px] text-gray-400">{u.email}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {u.phone}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'destructive'
                            : u.role === 'logistics_partner'
                            ? 'secondary'
                            : u.role === 'business'
                            ? 'default'
                            : 'outline'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {u.role.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={u.kycStatus === 'verified' ? 'success' : 'warning'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {u.kycStatus || 'pending'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{u.defaultLocation?.villageOrCity || 'Sonapur Hub'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
