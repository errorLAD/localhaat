'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            CONNECT WITH LOCALHAAT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Contact Us
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Questions regarding rural marketplace orders, logistics partnerships, village agent points, or business accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Contact Details Column */}
          <div className="md:col-span-5 space-y-4">
            <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs">
              <CardHeader className="bg-slate-50 border-b border-gray-100 py-3.5 px-5">
                <CardTitle className="text-sm font-bold text-gray-900">
                  Company & Support Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Brand</span>
                  <div className="font-bold text-gray-900 text-sm">LocalHaat</div>
                  <div className="text-gray-500">The Digital Backbone for Rural Commerce & Inter-Village Logistics</div>
                </div>

                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Operating Entity</span>
                  <div className="font-bold text-gray-900">InfraBlue Material Technologies Private Limited</div>
                  <div className="text-gray-500">Corporate & Operational Entity</div>
                </div>

                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Website</span>
                  <div className="font-mono text-emerald-700 font-bold">localhaat.in</div>
                </div>

                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Enquiries</span>
                  <div className="font-semibold text-gray-800">support@localhaat.in</div>
                  <div className="font-semibold text-gray-800">partners@localhaat.in</div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Handover Support</span>
              </div>
              <p className="leading-relaxed">
                For active parcel tracking, 4-digit handover codes, or delivery disputes, please visit the <Link href="/track" className="underline font-bold">Consignment Tracking</Link> tool or contact your assigned village agent.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-7">
            <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs">
              <CardHeader className="bg-slate-50 border-b border-gray-100 py-3.5 px-5">
                <CardTitle className="text-sm font-bold text-gray-900">
                  Send a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs">
                {submitted ? (
                  <div className="p-6 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-base text-gray-900">Thank you for getting in touch!</h3>
                    <p className="text-xs text-gray-600">
                      Our team at LocalHaat has received your query and will respond shortly.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="text-xs font-bold"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-9 rounded-xl border border-gray-300 px-3 text-xs"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-9 rounded-xl border border-gray-300 px-3 text-xs"
                          placeholder="name@example.com"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-9 rounded-xl border border-gray-300 px-3 text-xs"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Inquiry Category</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-9 rounded-xl border border-gray-300 px-3 text-xs bg-white font-medium"
                      >
                        <option value="general">Customer / General Inquiries</option>
                        <option value="logistics_partner">Logistics Partner / Commuter Registration</option>
                        <option value="village_agent">Village Agent Point Application</option>
                        <option value="business">Business Merchant Services</option>
                        <option value="drone_delivery">Phase 2 Drone Delivery Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-3 text-xs resize-none"
                        placeholder="How can we assist you?"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
