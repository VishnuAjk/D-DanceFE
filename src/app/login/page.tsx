'use client';

import type { ApiResponse } from '@danceapp/shared';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { resolveDashboardPath } from '@/lib/auth-routing';
import { type AuthUser, useAuth } from '@/providers/auth-provider';

interface OtpSendResponse {
  txnId: string;
  expiresIn: number;
}

interface OtpVerifyResponse {
  accessToken: string;
  user: AuthUser;
}

const PHONE_REGEX = /^[6-9]\d{9}$/;
const OTP_REGEX = /^\d{6}$/;

function formatApiError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'object' &&
    error.response.data.error !== null &&
    'message' in error.response.data.error &&
    typeof error.response.data.error.message === 'string'
  ) {
    return error.response.data.error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [resendLeft, setResendLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = PHONE_REGEX.test(phone) && !isSending;
  const canVerify = OTP_REGEX.test(otp) && !isVerifying;
  const resendLabel = useMemo(() => {
    if (resendLeft <= 0) {
      return 'Resend OTP';
    }

    const minutes = Math.floor(resendLeft / 60);
    const seconds = resendLeft % 60;

    if (minutes > 0) {
      return `Resend in ${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    return `Resend in 00:${String(seconds).padStart(2, '0')}`;
  }, [resendLeft]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(resolveDashboardPath(user.role));
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (resendLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendLeft]);

  async function sendOtp() {
    setError(null);
    setIsSending(true);

    try {
      const response = await apiClient.post<ApiResponse<OtpSendResponse>>('/api/auth/otp-send', {
        phone
      });
      const data = response.data.data;

      if (!data?.txnId) {
        throw new Error('OTP transaction was not created');
      }

      setTxnId(data.txnId);
      setOtp('');
      setStep('otp');
      setResendLeft(data.expiresIn);
    } catch (sendError) {
      setError(formatApiError(sendError));
    } finally {
      setIsSending(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setIsVerifying(true);

    try {
      const response = await apiClient.post<ApiResponse<OtpVerifyResponse>>('/api/auth/otp-verify', {
        phone,
        otp,
        txnId
      });
      const data = response.data.data;

      if (!data?.accessToken || !data.user) {
        throw new Error('Auth session payload was incomplete');
      }

      login(data.accessToken, data.user);
      router.replace(resolveDashboardPath(data.user.role));
    } catch (verifyError) {
      setError(formatApiError(verifyError));
    } finally {
      setIsVerifying(false);
    }
  }

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, '').slice(0, 10));
  }

  function handleOtpChange(value: string) {
    setOtp(value.replace(/\D/g, '').slice(0, 6));
  }

  function resetToPhoneStep() {
    setStep('phone');
    setOtp('');
    setTxnId('');
    setResendLeft(0);
    setError(null);
  }

  if (isLoading) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <p className="auth-card__eyebrow">Welcome back</p>
          <h1 className="auth-card__title">Opening your account.</h1>
          <p className="auth-card__text">
            Please wait while we check whether you are already signed in.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Secure OTP sign in</p>
        <h1 className="auth-card__title">Use your mobile number to continue.</h1>
        <p className="auth-card__text">
          New students and families can create an account with their mobile number. Instructors and admins
          should use the number assigned by the studio.
        </p>
        <div className="auth-stepper" aria-label="Login progress">
          <div className={`auth-stepper__item${step === 'phone' ? ' is-active' : ' is-complete'}`}>
            <span className="auth-stepper__index">1</span>
            <span>Phone</span>
          </div>
          <div className={`auth-stepper__item${step === 'otp' ? ' is-active' : ''}`}>
            <span className="auth-stepper__index">2</span>
            <span>OTP</span>
          </div>
        </div>
        <div className="stack" role="group" aria-label="OTP login form">
          <div className="field">
            <label className="field__label" htmlFor="phone">
              Mobile Number
            </label>
            <input
              id="phone"
              className="field__input"
              inputMode="numeric"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(event) => handlePhoneChange(event.target.value)}
              disabled={step === 'otp' || isSending || isVerifying}
              autoComplete="tel"
            />
          </div>

          {step === 'otp' ? (
            <div className="auth-inline-note">
              OTP sent to +91 {phone}. Make sure the latest code is used.
            </div>
          ) : null}

          {step === 'otp' ? (
            <div className="field">
              <label className="field__label" htmlFor="otp">
                One-Time Password
              </label>
              <input
                id="otp"
                className="field__input"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => handleOtpChange(event.target.value)}
                disabled={isVerifying}
                autoComplete="one-time-code"
              />
            </div>
          ) : null}

          {error ? (
            <div className="auth-feedback auth-feedback--error" role="alert">
              {error}
            </div>
          ) : null}

          {step === 'phone' ? (
            <button className="button button--primary" disabled={!canSend} type="button" onClick={sendOtp}>
              {isSending ? 'Sending OTP...' : 'Send OTP'}
            </button>
          ) : (
            <div className="auth-actions">
              <button
                className="button button--primary"
                disabled={!canVerify}
                type="button"
                onClick={verifyOtp}
              >
                {isVerifying ? 'Verifying...' : 'Verify and continue'}
              </button>
              <button
                className="button button--ghost"
                disabled={resendLeft > 0 || isSending || isVerifying}
                type="button"
                onClick={sendOtp}
              >
                {isSending ? 'Sending again...' : resendLabel}
              </button>
              <button
                className="button button--ghost"
                disabled={isSending || isVerifying}
                type="button"
                onClick={resetToPhoneStep}
              >
                Change number
              </button>
            </div>
          )}
        </div>
        <p className="auth-card__helper">
          Students and families can sign up here directly. Instructor and admin access is created by the studio
          team before first sign-in.
        </p>
        <Link className="auth-card__link" href="/">
          Back to homepage
        </Link>
      </section>
    </main>
  );
}
