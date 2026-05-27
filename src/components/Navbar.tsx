'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show navbar on admin pages
  if (pathname.startsWith('/penulis')) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-brand">Sastra Saya</Link>
        <button className={`hamburger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setIsOpen(false)}>Beranda</Link>
          <Link href="/cerpen" className={pathname === '/cerpen' ? 'active' : ''} onClick={() => setIsOpen(false)}>Cerpen</Link>
          <Link href="/puisi" className={pathname === '/puisi' ? 'active' : ''} onClick={() => setIsOpen(false)}>Puisi</Link>
        </div>
      </div>
    </nav>
  );
}
