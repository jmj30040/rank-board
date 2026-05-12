'use client';

import { useState } from 'react';
import AdminPanel from './AdminPanel';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('adminAuthenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setError('');
    } else {
      setError('비밀번호가 잘못되었습니다.');
    }
  };

  if (isAuthenticated) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">⚙️</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-slate-400 mt-2 font-medium">관리자 비밀번호를 입력하세요.</p>
        </div>
        <div className="space-y-6">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-sky-100 outline-none transition-all text-center text-lg font-black tracking-widest"
          />
          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] hover:bg-black transition-all font-black text-lg active:scale-95 shadow-xl shadow-slate-200"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}