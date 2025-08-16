/**
 * Register Page
 * 
 * Public page for user registration
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const redirectTo = searchParams.get('redirect') || '/';
  const inviteToken = searchParams.get('invite');

  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // User is already logged in, redirect
          router.push(redirectTo);
          return;
        }
      } catch (error) {
        // Not authenticated, continue to registration
      }
      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [router, redirectTo]);

  const handleRegisterSuccess = (user) => {
    console.log('Registration successful:', user.name);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* App Logo/Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            The Stack
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Conversation tracking and facilitation
          </p>
        </div>

        {/* Registration Form */}
        <RegisterForm 
          onSuccess={handleRegisterSuccess}
          redirectTo={redirectTo}
          inviteToken={inviteToken}
        />

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}