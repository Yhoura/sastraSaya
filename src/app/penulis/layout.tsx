'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuth(true);
      } else if (pathname !== '/penulis/login') {
        router.push('/penulis/login');
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
        if (pathname !== '/penulis/login') {
          router.push('/penulis/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/penulis/login');
  };

  // Show login page without sidebar
  if (pathname === '/penulis/login') {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  if (!isAuth) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">Sastra Saya</div>
        <nav className="sidebar-nav">
          <Link href="/penulis" className={`sidebar-link ${pathname === '/penulis' ? 'active' : ''}`}>
            📊 Dashboard
          </Link>
          <Link href="/penulis/upload" className={`sidebar-link ${pathname === '/penulis/upload' ? 'active' : ''}`}>
            ✍️ Tulis Karya
          </Link>
        </nav>
        <div className="sidebar-footer">
          <Link href="/" className="sidebar-link" target="_blank">🌐 Lihat Website</Link>
          <button onClick={handleLogout} className="sidebar-link sidebar-logout">🚪 Keluar</button>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
