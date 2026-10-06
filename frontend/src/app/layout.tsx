import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { GlobalPartnerRingingNotifier } from '../components/partner/GlobalPartnerRingingNotifier';
import Analytics from '../components/Analytics';
import { Wheat, Globe, ShieldCheck } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhaat.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LocalHaat — Rural Commerce & Inter-Village Logistics',
    template: '%s | LocalHaat',
  },
  description:
    'LocalHaat connects rural customers, local commerce, logistics partners, travelling partners and village agents through one digital platform.',
  keywords: [
    'LocalHaat',
    'localhaat.in',
    'rural commerce',
    'rural e-commerce',
    'village shopping',
    'village delivery',
    'rural delivery',
    'inter-village logistics',
    'parcel delivery',
    'local parcel delivery',
    'rural logistics',
    'village logistics',
    'local delivery',
    'small town shopping',
    'rural India marketplace',
    'village commerce',
    'local transport logistics',
  ],
  authors: [{ name: 'InfraBlue Material Technologies Private Limited' }],
  creator: 'InfraBlue Material Technologies Private Limited',
  publisher: 'LocalHaat',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'LocalHaat — Rural Commerce & Inter-Village Logistics',
    description:
      'The Digital Backbone for Rural Commerce & Inter-Village Logistics. Connecting customers, businesses, logistics partners, travelling partners and village agents.',
    url: SITE_URL,
    siteName: 'LocalHaat',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'LocalHaat — Rural Commerce & Logistics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalHaat — Rural Commerce & Inter-Village Logistics',
    description:
      'The Digital Backbone for Rural Commerce & Inter-Village Logistics. Built for Rural India. Built Around Local Networks.',
    images: ['/logo.png'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LocalHaat',
  legalName: 'InfraBlue Material Technologies Private Limited',
  url: 'https://localhaat.in',
  logo: 'https://localhaat.in/logo.png',
  description:
    'LocalHaat connects rural customers, local commerce, logistics partners, travelling partners and village agents through one digital platform.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://twitter.com/localhaat',
    'https://facebook.com/localhaat',
    'https://instagram.com/localhaat',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LocalHaat',
  url: 'https://localhaat.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://localhaat.in/marketplace?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Schema.org WebSite with SearchAction Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white overflow-x-hidden w-full max-w-full">
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Analytics />
              <Navbar />
              <GlobalPartnerRingingNotifier />
              <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>

              {/* ================================================== */}
              {/* LOCALHAAT COMPREHENSIVE RESPONSIVE FOOTER */}
              {/* ================================================== */}
              <footer className="bg-slate-900 text-slate-400 pt-10 sm:pt-14 pb-8 border-t border-slate-800 text-xs mt-auto w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
                  {/* FOOTER TOP: BRANDING & TAGLINES */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-800/80">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2.5">
                        <Link href="/" className="inline-block bg-white/95 px-3 py-1.5 rounded-xl shadow-sm hover:opacity-95 transition-opacity">
                          <img
                            src="/logo.png"
                            alt="LocalHaat — Rural Commerce & Logistics"
                            className="h-8 sm:h-9 w-auto max-w-[200px] object-contain"
                          />
                        </Link>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        The Digital Backbone for Rural Commerce & Inter-Village Logistics
                      </p>
                      <p className="text-xs text-slate-400">
                        Local Commerce. Local Logistics. Connected Villages.
                      </p>
                      <p className="text-[11px] text-emerald-400/90 font-medium">
                        Built for Rural India. Built Around Local Networks.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <a
                        href="https://localhaat.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition-colors w-full sm:w-auto min-h-[44px]"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>localhaat.in</span>
                      </a>
                      <Link
                        href="/about"
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-semibold text-xs transition-colors shadow-sm w-full sm:w-auto min-h-[44px]"
                      >
                        <span>About LocalHaat</span>
                      </Link>
                    </div>
                  </div>

                  {/* 5 COLUMNS RESPONSIVE NAVIGATION */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 text-xs">
                    {/* COLUMN 1 — ABOUT LOCALHAAT */}
                    <div className="space-y-3">
                      <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                        About LocalHaat
                      </h4>
                      <ul className="space-y-2 text-slate-400">
                        <li>
                          <Link href="/about" className="hover:text-white transition-colors inline-block py-0.5">
                            About Us
                          </Link>
                        </li>
                        <li>
                          <Link href="/about#mission" className="hover:text-white transition-colors inline-block py-0.5">
                            Our Mission
                          </Link>
                        </li>
                        <li>
                          <Link href="/about#how-it-works" className="hover:text-white transition-colors inline-block py-0.5">
                            How LocalHaat Works
                          </Link>
                        </li>
                        <li>
                          <Link href="/about#our-network" className="hover:text-white transition-colors inline-block py-0.5">
                            Our Network
                          </Link>
                        </li>
                        <li>
                          <Link href="/marketplace" className="hover:text-white transition-colors inline-block py-0.5">
                            Rural Commerce
                          </Link>
                        </li>
                        <li>
                          <Link href="/parcels" className="hover:text-white transition-colors inline-block py-0.5">
                            Logistics Network
                          </Link>
                        </li>
                        <li>
                          <Link href="/agent" className="hover:text-white transition-colors inline-block py-0.5">
                            Village Agent Network
                          </Link>
                        </li>
                        <li>
                          <Link href="/drone-delivery" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 py-0.5">
                            <span>Drone Delivery</span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300">Phase 2</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 2 — FOR CUSTOMERS */}
                    <div className="space-y-3">
                      <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                        For Customers
                      </h4>
                      <ul className="space-y-2 text-slate-400">
                        <li>
                          <Link href="/marketplace" className="hover:text-white transition-colors inline-block py-0.5">
                            Shop Products
                          </Link>
                        </li>
                        <li>
                          <Link href="/parcels" className="hover:text-white transition-colors inline-block py-0.5">
                            Send a Parcel
                          </Link>
                        </li>
                        <li>
                          <Link href="/track" className="hover:text-white transition-colors inline-block py-0.5">
                            Track Parcel
                          </Link>
                        </li>
                        <li>
                          <Link href="/orders" className="hover:text-white transition-colors inline-block py-0.5">
                            My Orders
                          </Link>
                        </li>
                        <li>
                          <Link href="/delivery-info" className="hover:text-white transition-colors inline-block py-0.5">
                            Delivery Information
                          </Link>
                        </li>
                        <li>
                          <Link href="/support" className="hover:text-white transition-colors inline-block py-0.5">
                            Help & Support
                          </Link>
                        </li>
                        <li>
                          <Link href="/faqs" className="hover:text-white transition-colors inline-block py-0.5">
                            FAQs
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 3 — FOR PARTNERS */}
                    <div className="space-y-3">
                      <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                        For Partners
                      </h4>
                      <ul className="space-y-2 text-slate-400">
                        <li>
                          <Link href="/partner/signup/logistics" className="hover:text-white transition-colors inline-block py-0.5">
                            Logistics Partner
                          </Link>
                        </li>
                        <li>
                          <Link href="/partner/signup/travelling" className="hover:text-white transition-colors inline-block py-0.5">
                            Travelling Partner
                          </Link>
                        </li>
                        <li>
                          <Link href="/signup?role=village_agent" className="hover:text-white transition-colors inline-block py-0.5">
                            Become Village Agent
                          </Link>
                        </li>
                        <li>
                          <Link href="/login?role=partner" className="hover:text-white transition-colors inline-block py-0.5">
                            Partner Login
                          </Link>
                        </li>
                        <li>
                          <Link href="/support?type=partner" className="hover:text-white transition-colors inline-block py-0.5">
                            Partner Support
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 4 — FOR BUSINESSES */}
                    <div className="space-y-3">
                      <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                        For Businesses
                      </h4>
                      <ul className="space-y-2 text-slate-400">
                        <li>
                          <Link href="/business" className="hover:text-white transition-colors inline-block py-0.5">
                            Business Logistics
                          </Link>
                        </li>
                        <li>
                          <Link href="/login?role=business" className="hover:text-white transition-colors inline-block py-0.5">
                            Business Account
                          </Link>
                        </li>
                        <li>
                          <Link href="/business/shipments" className="hover:text-white transition-colors inline-block py-0.5">
                            Shipment Services
                          </Link>
                        </li>
                        <li>
                          <Link href="/support?type=business" className="hover:text-white transition-colors inline-block py-0.5">
                            Business Support
                          </Link>
                        </li>
                        <li>
                          <Link href="/contact?subject=business" className="hover:text-white transition-colors inline-block py-0.5">
                            Contact Business Team
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 5 — IMPORTANT */}
                    <div className="space-y-3 col-span-2 md:col-span-1">
                      <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                        Important
                      </h4>
                      <ul className="space-y-2 text-slate-400">
                        <li>
                          <Link href="/terms" className="hover:text-white transition-colors inline-block py-0.5">
                            Terms & Conditions
                          </Link>
                        </li>
                        <li>
                          <Link href="/privacy" className="hover:text-white transition-colors inline-block py-0.5">
                            Privacy Policy
                          </Link>
                        </li>
                        <li>
                          <Link href="/shipping-policy" className="hover:text-white transition-colors inline-block py-0.5">
                            Shipping & Delivery
                          </Link>
                        </li>
                        <li>
                          <Link href="/refund-policy" className="hover:text-white transition-colors inline-block py-0.5">
                            Cancellation & Refund
                          </Link>
                        </li>
                        <li>
                          <Link href="/prohibited-items" className="hover:text-white transition-colors inline-block py-0.5">
                            Prohibited Items
                          </Link>
                        </li>
                        <li>
                          <Link href="/safety" className="hover:text-white transition-colors inline-block py-0.5">
                            Safety Guidelines
                          </Link>
                        </li>
                        <li>
                          <Link href="/contact" className="hover:text-white transition-colors inline-block py-0.5">
                            Contact Us
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* BOTTOM FOOTER BAR */}
                  <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
                    <div className="text-center md:text-left leading-relaxed">
                      © 2026 LocalHaat. All rights reserved. LocalHaat is a brand operated by <strong className="text-slate-300 font-semibold">InfraBlue Material Technologies Private Limited</strong>.
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-slate-400">
                      <Link href="/privacy" className="hover:text-slate-200 transition-colors">
                        Privacy Policy
                      </Link>
                      <span>•</span>
                      <Link href="/terms" className="hover:text-slate-200 transition-colors">
                        Terms & Conditions
                      </Link>
                      <span>•</span>
                      <Link href="/shipping-policy" className="hover:text-slate-200 transition-colors">
                        Shipping & Delivery
                      </Link>
                      <span>•</span>
                      <Link href="/refund-policy" className="hover:text-slate-200 transition-colors">
                        Cancellation & Refund
                      </Link>
                      <span>•</span>
                      <Link href="/contact" className="hover:text-slate-200 transition-colors">
                        Contact Us
                      </Link>
                    </div>

                    <div className="font-mono text-emerald-400 font-semibold">
                      localhaat.in
                    </div>
                  </div>
                </div>
              </footer>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
