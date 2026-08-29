import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

interface ResetPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid token. Please request a new password reset link.');
      return;
    }
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password Reset Successful', 'Your password has been changed successfully.');
      onNavigateToLogin();
    } catch (err: any) {
      toast.error('Password Reset Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center px-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black tracking-tight">Create a new password</h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter your new password below.
          </p>
        </div>

        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="form">
            <div className="title">Campus OS<br/><span>reset password</span></div>
            
            <input 
              type="password" 
              placeholder="New Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="input w-full" 
              required 
              minLength={6}
            />
            
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="input w-full" 
              required 
              minLength={6}
            />
            
            <button type="submit" disabled={loading} className="button-confirm w-full">
              {loading ? 'Resetting...' : 'Change Password'}
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
