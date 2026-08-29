import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset Link Sent', 'If an account exists for this email, a reset link has been sent.');
      setEmail('');
    } catch (err: any) {
      toast.error('Failed to process request', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center px-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black tracking-tight">Reset your password</h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="form">
            <div className="title">Campus OS<br/><span>forgot password</span></div>
            
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="input w-full" 
              required 
            />
            
            <button type="submit" disabled={loading} className="button-confirm w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="mt-2 text-center text-xs text-[var(--font-color-sub)] w-full">
              <button type="button" onClick={onNavigateToLogin} className="font-bold text-[var(--font-color)] hover:underline">
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
