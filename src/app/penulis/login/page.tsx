'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email atau password salah.');
      setLoading(false);
    } else {
      router.push('/penulis');
      router.refresh();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Masuk</h1>
        <p className="login-subtitle">Selamat datang kembali, Penulis.</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@contoh.com" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
