import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaExclamationTriangle, FaSignOutAlt, FaCalendar, FaEye, FaEyeSlash, FaKey, FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'https://prarabdhsingh.onrender.com/api';

const AdminDashboard = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // New States
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard Change Password States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changePasswordStatus, setChangePasswordStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      await axios.post(`${API_URL}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAuth(true);
      fetchMessages(token);
    } catch (err) {
      localStorage.removeItem('adminToken');
      setIsAuth(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token } = res.data;
      localStorage.setItem('adminToken', token);
      setIsAuth(true);
      fetchMessages(token);
    } catch (err) {
      if (!err.response) {
        setError('Network error: Is your backend server running on port 5000?');
      } else {
        setError(err.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuth(false);
    setMessages([]);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccessMsg('OTP sent to your email! Please check your inbox.');
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      setSuccessMsg('Password securely reset! Please login below.');
      setIsForgotPassword(false);
      setOtpSent(false);
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setChangePasswordStatus({ error: '', success: '' });
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/auth/change-password`, { 
        currentPassword: changeCurrentPassword, 
        newPassword: changeNewPassword 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChangePasswordStatus({ error: '', success: 'Password successfully updated!' });
      setChangeCurrentPassword('');
      setChangeNewPassword('');
      setTimeout(() => setIsChangePasswordOpen(false), 2000);
    } catch (err) {
      setChangePasswordStatus({ error: err.response?.data?.error || 'Failed to update password', success: '' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] selection:bg-accentCyan/30 selection:text-accentCyan font-sans p-6">
        {/* Subtle Background */}
        <div className="absolute inset-0 z-0 bg-dot-grid-dark opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
          className="w-full max-w-md p-10 bg-[#12141D]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] shadow-accentCyan/10 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accentCyan/10 rounded-bl-full blur-2xl pointer-events-none"></div>
          
          <div className="text-center mb-8 relative z-10">
            <motion.div 
              initial={{ rotate: -10 }} animate={{ rotate: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accentCyan/20 to-accentCyan/5 text-accentCyan mb-4 border border-accentCyan/20 shadow-lg shadow-accentCyan/5"
            >
              {isForgotPassword ? <FaKey className="text-2xl" /> : <FaLock className="text-2xl" />}
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight brand-logo">
              {isForgotPassword ? 'Reset Password' : 'Admin Access'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {isForgotPassword ? (otpSent ? 'Enter OTP and your new password.' : 'Enter your email to receive an OTP.') : 'Sign in to access your secure dashboard.'}
            </p>
          </div>

          {!isForgotPassword ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10 transition-all">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                  <FaExclamationTriangle className="shrink-0" /> <p>{error}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-4 bg-accentCyan/10 border border-accentCyan/20 rounded-xl text-accentCyan text-sm font-medium">
                  <FaCheckCircle className="shrink-0" /> <p>{successMsg}</p>
                </motion.div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admin Email</label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 focus:shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)] transition-all placeholder:text-slate-600 font-medium"
                  placeholder="admin@portfolio.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} className="text-xs font-bold text-slate-400 hover:text-accentCyan transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 focus:shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)] transition-all placeholder:text-slate-600 font-medium pr-12"
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accentCyan transition-colors p-1">
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-accentCyan to-cyan-400 text-[#07090E] font-extrabold text-sm tracking-widest uppercase hover:opacity-90 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          ) : (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="flex flex-col gap-5 relative z-10">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                  <FaExclamationTriangle className="shrink-0" /> <p>{error}</p>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-4 bg-accentCyan/10 border border-accentCyan/20 rounded-xl text-accentCyan text-sm font-medium">
                  <FaCheckCircle className="shrink-0" /> <p>{successMsg}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admin Email</label>
                <input
                  type="email" required disabled={otpSent}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 transition-all placeholder:text-slate-600 font-medium ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="admin@portfolio.com"
                />
              </div>

              {otpSent && (
                <>
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      <span>Enter 6-Digit OTP</span>
                    </label>
                    <input
                      type="text" required
                      value={otp} onChange={(e) => setOtp(e.target.value)}
                      className="bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 transition-all placeholder:text-slate-600 font-medium tracking-[0.2em]"
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} required
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 transition-all placeholder:text-slate-600 font-medium pr-12"
                        placeholder="New Password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accentCyan transition-colors p-1">
                        {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accentCyan to-cyan-400 text-[#07090E] font-extrabold text-sm tracking-widest uppercase hover:opacity-90 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (otpSent ? 'Reset Password' : 'Send OTP')}
                </button>
                <button
                  type="button" onClick={() => { setIsForgotPassword(false); setOtpSent(false); setError(''); setSuccessMsg(''); }}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-bold text-sm tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all"
                >
                  Back to Login
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] dark font-sans text-slate-100 transition-colors duration-500 overflow-x-hidden p-6 md:p-12 relative z-0">
      <div className="fixed inset-0 pointer-events-none bg-dot-grid-dark opacity-30 z-[-1]" style={{ maskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)' }}></div>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accentCyan/10 rounded-full blur-[150px] pointer-events-none z-[-1]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-[-1]"></div>

      <div className="max-w-6xl mx-auto border-t-[0px]">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6 p-6 md:p-8 bg-gradient-to-r from-[#12141D]/90 to-[#1A1C29]/90 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-accentCyan/10 rounded-b-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold brand-logo text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Inbox Command Center</h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div> Secure Administrator Portal</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => { setIsChangePasswordOpen(true); setChangePasswordStatus({ error: '', success: '' }); }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-accentCyan/10 hover:text-accentCyan text-slate-300 border border-white/10 hover:border-accentCyan/30 font-bold transition-all text-sm uppercase tracking-wider"
            >
              <FaKey /> Change Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-white/10 hover:border-red-500/30 font-bold transition-all text-sm uppercase tracking-wider"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* Cinematic Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#12141D]/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-accentCyan/30 transition-all">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-accentCyan/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accentCyan/20 transition-colors"></div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Messages</h3>
            <div className="text-4xl font-extrabold text-white brand-logo">{messages.length}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#12141D]/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/20 transition-colors"></div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">System Status</h3>
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2 mt-1"><div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div> Online</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#12141D]/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors"></div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Last Activity</h3>
            <div className="text-lg font-bold text-white mt-1 pt-1">{messages.length > 0 ? new Date(messages[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[#12141D]/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-xl">
              <FaEnvelope className="text-6xl text-slate-600/50 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white brand-logo">All Caught Up</h3>
              <p className="text-slate-500 mt-2 font-medium">No messages have arrived in your secure inbox yet.</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={msg._id}
                className="bg-[#12141D]/80 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] group hover:border-accentCyan/30 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accentCyan/5 rounded-bl-[100px] blur-3xl pointer-events-none group-hover:bg-accentCyan/10 transition-colors duration-500"></div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-white/5 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accentCyan transition-colors">{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className="text-accentCyan/80 hover:text-accentCyan text-sm font-medium hover:underline flex items-center gap-2">
                      <FaEnvelope /> {msg.email}
                    </a>
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg inline-flex self-start md:self-auto">
                    <FaCalendar />
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md p-8 bg-[#12141D] border border-white/10 rounded-3xl shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] shadow-accentCyan/10 relative"
          >
            <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3 brand-logo"><FaKey className="text-accentCyan" /> Update Security</h3>
            
            {changePasswordStatus.error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                <FaExclamationTriangle className="shrink-0" /> <p>{changePasswordStatus.error}</p>
              </motion.div>
            )}
            {changePasswordStatus.success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 mb-4 bg-accentCyan/10 border border-accentCyan/20 rounded-xl text-accentCyan text-sm font-medium">
                <FaCheckCircle className="shrink-0" /> <p>{changePasswordStatus.success}</p>
              </motion.div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={changeCurrentPassword} onChange={(e) => setChangeCurrentPassword(e.target.value)}
                    className="w-full bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 transition-all font-medium pr-12"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accentCyan transition-colors p-1">
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={changeNewPassword} onChange={(e) => setChangeNewPassword(e.target.value)}
                    className="w-full bg-[#0B0C10]/50 border border-white/5 py-3.5 px-4 rounded-xl text-white outline-none focus:border-accentCyan/50 focus:bg-white/5 transition-all font-medium pr-12"
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accentCyan transition-colors p-1">
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" disabled={loading} onClick={() => { setIsChangePasswordOpen(false); setChangeCurrentPassword(''); setChangeNewPassword(''); }} className="flex-1 py-3.5 rounded-xl bg-white/5 text-slate-300 font-bold text-sm uppercase tracking-widest hover:bg-white/10 border border-white/5 transition-all disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accentCyan to-cyan-400 text-[#07090E] font-extrabold text-sm uppercase tracking-widest hover:opacity-90 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50">{loading ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
