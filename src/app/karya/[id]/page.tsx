import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase, type Karya } from '@/lib/supabase';
import 'react-quill-new/dist/quill.snow.css';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: karya } = await supabase
    .from('karya')
    .select('*')
    .eq('id', id)
    .single();

  if (!karya) {
    return {
      title: 'Karya Tidak Ditemukan - Sastra Saya',
    };
  }

  const excerpt = karya.ringkasan || karya.konten.replace(/<[^>]*>?/gm, '').substring(0, 160);

  return {
    title: `${karya.judul} - Sastra Saya`,
    description: excerpt,
    openGraph: {
      images: karya.image_url ? [karya.image_url] : [],
    }
  };
}

export default async function KaryaDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: karya } = await supabase
    .from('karya')
    .select('*')
    .eq('id', id)
    .single();

  if (!karya) {
    notFound();
  }

  const typedKarya = karya as Karya;

  const date = new Date(typedKarya.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Navbar />

      <main>
        <article className="detail-page">
          <div className="container">
            <div className="detail-header">
              <span className={`badge badge-${typedKarya.kategori}`}>
                {typedKarya.kategori === 'cerpen' ? '📖 Cerpen' : '📝 Puisi'}
              </span>
              <h1 className="detail-title">{typedKarya.judul}</h1>
              <time className="detail-date">{date}</time>
            </div>

            {typedKarya.image_url && (
              <div className="detail-hero-image" style={{ width: '100%', height: '400px', position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem', marginTop: '1rem' }}>
                <Image 
                  src={typedKarya.image_url} 
                  alt={typedKarya.judul} 
                  fill 
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            )}

            <div 
              className={`detail-content detail-content-${typedKarya.kategori} ql-editor`}
              style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: typedKarya.konten }}
            />

            <div className="detail-footer">
              <Link href={`/${typedKarya.kategori}`} className="btn btn-outline">
                ← Kembali ke {typedKarya.kategori === 'cerpen' ? 'Cerpen' : 'Puisi'}
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
