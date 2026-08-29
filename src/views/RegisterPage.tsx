import React, { useState } from 'react';
import { Compass, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import './LoginPage.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; interface RegisterPageProps { onNavigateToLogin: () => void; onNavigateToLanding: () => void;
} export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin, onNavigateToLanding
}) => { const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, startDemo } = useAuth();
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!name || !email || !password || !confirmPassword) { toast.error('Please fill in all fields.'); return;
    };
  if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return;
    }
  if (password !== confirmPassword) { toast.error('Passwords do not match.'); return;
    } setLoading(true);
  try { await register({ name, email, password, confirmPassword });
  toast.success('Account Created', 'Welcome to Campus OS! Your intelligence suite is ready.');
    }
  catch (err: any) { toast.error('Registration Failed', err.message);
    }
  finally { setLoading(false);
    }
  };
  const handleDemo = async () => { setLoading(true);
  try { await startDemo();
  toast.success('Demo Session Started', 'Sample student academic profile loaded.');
    }
  catch (err: any) { toast.error('Demo Error', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center px-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <button onClick={onNavigateToLanding} className="inline-flex items-center gap-2.5 group mb-4 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl text-black tracking-tight">CAMPUS OS</span>
          </button>
          <h2 className="text-2xl font-bold text-black tracking-tight">Create your academic account</h2>
          <p className="text-xs text-gray-500 mt-1"> Track attendance buffers, predict SGPA, and receive tailored daily action lists.
          </p>
        </div>

        {/* Card */}
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="form">
            <div className="title">Campus OS<br/><span>create an account</span></div>
            
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input" required />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input" required minLength={6} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required minLength={6} />
            
            <div className="login-with flex flex-col items-start gap-1">
              <span className="text-xs font-bold text-[var(--font-color-sub)]">Or continue with:</span>
              <div className="flex gap-2">
                <a href="/api/auth/google" title="Google Sign-In" className="button-log">
                   <svg className="icon w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                </a>
                <button type="button" onClick={handleDemo} disabled={loading} title="1-Click Demo Preview" className="button-log">
                  <ShieldCheck className="icon w-6 h-6" />
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="button-confirm">
              {loading ? '...' : 'Register'}
            </button>

            <div className="mt-2 text-center text-xs text-[var(--font-color-sub)] w-full">
              <span>Already have an account? </span>
              <button type="button" onClick={onNavigateToLogin} className="font-bold text-[var(--font-color)] hover:underline">
                Sign in
              </button>
            </div>
          </form>
        </div>

        {/* Back to landing */}
        <div className="mt-4 text-center">
          <button onClick={onNavigateToLanding} className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
};
