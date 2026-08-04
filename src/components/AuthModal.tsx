'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, Sparkles } from 'lucide-react';
import { loginApi, registerApi } from '../lib/api';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
}

type Mode = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your name.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const result = mode === 'login'
        ? await loginApi(email, password)
        : await registerApi(email, password, name);

      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      onAuthSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px 13px 44px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          padding: '20px',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        data-testid="auth-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'rgba(18,18,18,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Header gradient strip */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, var(--primary-color), #ff6b6b, #ffd93d)',
          }} />

          <div style={{ padding: '36px 36px 32px' }}>
            {/* Logo & title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'var(--primary-color)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>Streamly</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>All-in-One Streaming</div>
                </div>
              </div>
              <button
                onClick={onClose}
                data-testid="auth-modal-close"
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode switcher tabs */}
            <div style={{
              display: 'flex', gap: '4px', marginBottom: '28px',
              background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px',
            }}>
              {(['login', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  data-testid={`auth-tab-${m}`}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '7px',
                    background: mode === m ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none', color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)',
                    fontWeight: mode === m ? 700 : 500, fontSize: '0.88rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Name (signup only) */}
                {mode === 'signup' && (
                  <div style={{ position: 'relative' }}>
                    <User
                      size={17}
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-testid="auth-name-input"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                )}

                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="auth-email-input"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Password */}
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="auth-password-input"
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password (signup only) */}
                {mode === 'signup' && (
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={17}
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      data-testid="auth-confirm-password-input"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)',
                        color: '#ff6b6b', fontSize: '0.85rem',
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="auth-submit-btn"
                  style={{
                    padding: '14px', borderRadius: '10px',
                    background: loading ? 'rgba(229,9,20,0.5)' : 'var(--primary-color)',
                    border: 'none', color: '#fff', fontWeight: 700,
                    fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'background 0.2s, transform 0.1s',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading && <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />}
                  {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>

                {/* Guest option */}
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="auth-guest-btn"
                  style={{
                    padding: '10px', borderRadius: '8px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.45)', fontWeight: 500,
                    fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  Continue as Guest
                </button>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
