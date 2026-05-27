import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KaryaCard from '@/components/KaryaCard';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function Home() {
  const { data: cerpenList } = await supabase
    .from('karya')
    .select('*')
    .eq('kategori', 'cerpen')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: puisiList } = await supabase
    .from('karya')
    .select('*')
    .eq('kategori', 'puisi')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-ornament"></div>
            <h1 className="hero-title">Sastra Saya</h1>
            <p className="hero-subtitle">
              Ruang di mana kata-kata menjadi jiwa, dan cerita menemukan maknanya.
            </p>
            <div className="hero-ornament"></div>
          </div>
        </section>

        {/* Recent Cerpen Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Cerpen Terbaru</h2>
            {cerpenList && cerpenList.length > 0 ? (
              <>
                <div className="karya-grid">
                  {cerpenList.map((karya) => (
                    <KaryaCard key={karya.id} karya={karya} />
                  ))}
                </div>
                <div className="section-cta">
                  <Link href="/cerpen" className="btn btn-outline">
                    Lihat Semua Cerpen →
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📖</p>
                <p className="empty-text">Belum ada cerpen yang diterbitkan.</p>
                <p className="empty-subtext">Cerita-cerita indah akan segera hadir.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Puisi Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Puisi Terbaru</h2>
            {puisiList && puisiList.length > 0 ? (
              <>
                <div className="karya-grid">
                  {puisiList.map((karya) => (
                    <KaryaCard key={karya.id} karya={karya} />
                  ))}
                </div>
                <div className="section-cta">
                  <Link href="/puisi" className="btn btn-outline">
                    Lihat Semua Puisi →
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📝</p>
                <p className="empty-text">Belum ada puisi yang diterbitkan.</p>
                <p className="empty-subtext">Bait-bait puisi akan segera mengalir.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
