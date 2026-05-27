import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KaryaCard from '@/components/KaryaCard';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Puisi - Sastra Saya',
  description: 'Kumpulan puisi pilihan di Sastra Saya. Jelajahi bait-bait puisi yang penuh makna.',
};

export default async function PuisiPage() {
  const { data: puisiList } = await supabase
    .from('karya')
    .select('*')
    .eq('kategori', 'puisi')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />

      <main>
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Puisi</h1>
            <p className="page-subtitle">Kumpulan puisi yang mengalir dari hati dan merangkai makna kehidupan.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {puisiList && puisiList.length > 0 ? (
              <div className="karya-grid">
                {puisiList.map((karya) => (
                  <KaryaCard key={karya.id} karya={karya} />
                ))}
              </div>
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
