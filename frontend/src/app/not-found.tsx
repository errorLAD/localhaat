import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Layers, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

export const metadata = {
  title: 'Page Not Found | LocalHaat',
  description: 'The page you requested could not be found. Return to LocalHaat rural commerce and logistics.',
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-[#faf9f5]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs">
          <span className="font-mono text-3xl font-extrabold">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Let’s get you back to LocalHaat. The link you clicked may have moved, expired, or was entered incorrectly.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold h-11 text-xs rounded-xl flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Button>
          </Link>
          <Link href="/marketplace" className="flex-1">
            <Button variant="outline" className="w-full font-bold h-11 text-xs rounded-xl border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Shop Products</span>
            </Button>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-4 text-xs font-semibold text-gray-500">
          <Link href="/marketplace#categories" className="hover:text-primary-700 transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Categories</span>
          </Link>
          <span>•</span>
          <Link href="/track" className="hover:text-primary-700 transition-colors flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Track Parcel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
