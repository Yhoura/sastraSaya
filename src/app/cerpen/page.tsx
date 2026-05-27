import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KaryaCard from '@/components/KaryaCard';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Cerpen - Sastra Saya',
  description: 'Kumpulan cerpen pilihan di Sastra Saya. Jelajahi cerita-cerita pendek yang menyentuh jiwa.',
};

export default async function CerpenPage() {
  const { data: cerpenList } = await supabase
    .from('karya')
    .select('*')
    .eq('kategori', 'cerpen')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />

      <main>
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Cerpen</h1>
            <p className="page-subtitle">Kumpulan cerita pendek yang menyentuh jiwa dan membangkitkan imajinasi.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {cerpenList && cerpenList.length > 0 ? (
              <div className="karya-grid">
                {cerpenList.map((karya) => (
                  <KaryaCard key={karya.id} karya={karya} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📖</p>
                <p className="empty-text">Belum ada cerpen yang diterbitkan.</p>
                <p className="empty-subtext">Cerita-cerita indah akan segera hadir.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
