'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import {
  Phone,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Truck,
  Store,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, requestOtp, loginWithOtp, logout, isLoading } = useAuth();

  const [isAdminLoginNotice, setIsAdminLoginNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('logout=true')) {
        logout();
      }
      if (window.location.search.includes('role=admin')) {
        setIsAdminLoginNotice(true);
      }
    }
  }, []);

  // Mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');

  // Password fields
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [otpPhone, setOtpPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  // State
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);

  const handleRoleRedirect = (role: string) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get('redirect');
      if (redirectTarget) {
        if (!redirectTarget.startsWith('/admin') || role === 'admin') {
          router.push(redirectTarget);
          return;
        }
      }
    }

    switch (role) {
      case 'logistics_partner':
        router.push('/partner/dashboard');
        break;
      case 'village_agent':
        router.push('/agent/dashboard');
        break;
      case 'business':
        router.push('/business/dashboard');
        break;
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'customer':
      default:
        router.push('/customer/dashboard');
        break;
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile phone number or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setError(null);
    try {
      const user = await login(identifier.trim(), password);
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = otpPhone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    try {
      await requestOtp(clean);
      setOtpStep(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setError(null);
    try {
      const clean = otpPhone.replace(/\D/g, '').slice(-10);
      const user = await loginWithOtp(clean, otp);
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 to-emerald-50/20 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign In to <span className="text-primary-700">LocalHaat</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-md mx-auto">
            The Digital Backbone for Rural Commerce & Inter-Village Logistics
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="shadow-lg border-gray-200/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                {loginMode === 'password'
                  ? 'Account Sign In'
                  : otpStep
                  ? 'Verify Mobile OTP'
                  : 'Sign In with OTP'}
              </CardTitle>

              {/* Toggle Mode */}
              <button
                type="button"
                onClick={() => {
                  setLoginMode(loginMode === 'password' ? 'otp' : 'password');
                  setError(null);
                  setOtpStep(false);
                }}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 underline flex items-center gap-1"
              >
                {loginMode === 'password' ? 'Use Mobile OTP instead' : 'Use Password instead'}
              </button>
            </div>
            <CardDescription className="text-xs text-gray-500">
              {loginMode === 'password'
                ? 'Enter your registered Mobile number or Email address'
                : otpStep
                ? `Enter the 6-digit passcode sent to +91 ${otpPhone.slice(-10)}`
                : 'We will send a 6-digit one-time passcode to your mobile phone'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isAdminLoginNotice && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-900 shadow-2xs">
                <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-950">Administrator Sign In Required</div>
                  <div className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                    Access to the Platform Control Center is restricted to Administrators. Please enter your administrator credentials (e.g. <strong>gokul@localhaat.in</strong>) to continue.
                  </div>
                </div>
              </div>
            )}
            {user && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-900">
                    Active Session: {user.name}
                  </div>
                  <div className="text-gray-600 font-mono text-[11px]">
                    {user.phone || user.email} • Role: {user.role}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoleRedirect(user.role)}
                    className="text-xs h-7 px-2.5 bg-white border-blue-300 text-blue-800 font-semibold"
                  >
                    Dashboard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      logout();
                      setError(null);
                    }}
                    className="text-xs h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            )}

            {/* PASSWORD LOGIN FORM */}
            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. 9876543210 or user@example.com"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError(null);
                      }}
                      className="h-11 text-sm pl-3 pr-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      className="text-xs text-primary-700 hover:text-primary-900 font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
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

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-1 space-y-2.5">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-sm font-bold bg-primary-700 hover:bg-primary-800 text-white shadow-sm"
                  >
                    {isLoading ? 'Verifying Credentials...' : 'Login'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoginMode('otp');
                      if (identifier && /^\d+$/.test(identifier)) {
                        setOtpPhone(identifier);
                      }
                      setError(null);
                    }}
                    className="w-full h-11 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continue with OTP
                  </Button>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Don't have an account yet?</span>
                  <Link
                    href="/signup"
                    className="font-bold text-primary-700 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
                  >
                    Create Account <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </form>
            )}

            {/* OTP LOGIN FORM */}
            {loginMode === 'otp' && (
              <>
                {!otpStep ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-gray-500 font-bold">
                          +91
                        </span>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          value={otpPhone}
                          onChange={(e) => {
                            setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                            setError(null);
                          }}
                          className="h-11 pl-12 text-sm font-medium tracking-wide"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || otpPhone.length < 10}
                      className="w-full h-11 text-sm font-bold bg-primary-700 hover:bg-primary-800 text-white"
                    >
                      {isLoading ? 'Sending Passcode...' : 'Send OTP Code'}
                    </Button>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Need a customer account?</span>
                      <Link
                        href="/signup"
                        className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
                      >
                        Create Account
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        6-Digit Verification Code
                      </label>
                      <Input
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setError(null);
                        }}
                        className="text-center font-mono text-xl font-bold tracking-widest h-12"
                        autoFocus
                        required
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full h-11 text-sm font-bold bg-primary-700 hover:bg-primary-800 text-white"
                    >
                      {isLoading ? 'Verifying Passcode...' : 'Verify & Log In'}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep(false);
                          setOtp('');
                        }}
                        className="hover:text-gray-900 underline"
                      >
                        Change Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="hover:text-primary-700 underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Switcher Portals */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/partner/signup"
            className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 group-hover:text-primary-700">
              <Truck className="w-4 h-4 text-primary-600" />
              Are you a partner?
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
              <span>Partner Onboarding</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/agent/signup"
            className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 group-hover:text-primary-700">
              <Store className="w-4 h-4 text-emerald-600" />
              Are you an Agent?
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
              <span>Village Agent Hub</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/business"
            className="p-3.5 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 group-hover:text-primary-700">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Business Customer?
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
              <span>Enterprise Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Legal Information Box */}
        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-[11px] text-center space-y-1">
          <div className="font-semibold text-gray-800">Secure Platform Verification</div>
          <p>
            LocalHaat is operated by <strong>InfraBlue Material Technologies Private Limited</strong>.
            Authorized access only. Transport operations, parcel handovers, and cash collections are strictly logged for safety.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Password Reset</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              In LocalHaat, mobile OTP authentication is the primary recovery mechanism. If you forgot your password, simply click <strong>Continue with OTP</strong> on the sign-in screen to log in immediately with your verified mobile number.
            </p>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => {
                  setForgotModal(false);
                  setLoginMode('otp');
                }}
                className="bg-primary-700 text-white text-xs h-9"
              >
                Switch to Mobile OTP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
