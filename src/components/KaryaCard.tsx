import Link from 'next/link';
import Image from 'next/image';
import type { Karya } from '@/lib/supabase';

export default function KaryaCard({ karya }: { karya: Karya }) {
  const date = new Date(karya.created_at).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const excerpt = karya.ringkasan || karya.konten.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

  return (
    <article className="karya-card animate-fadeInUp">
      {karya.image_url && (
        <div className="card-image-wrapper" style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', marginBottom: '1rem' }}>
          <Image 
            src={karya.image_url} 
            alt={karya.judul} 
            fill 
            style={{ objectFit: 'cover' }} 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div style={{ padding: karya.image_url ? '0 2rem 2rem' : '0' }}>
        <span className={`badge badge-${karya.kategori}`}>
          {karya.kategori === 'cerpen' ? '📖 Cerpen' : '📝 Puisi'}
        </span>
        <h3 className="card-title">{karya.judul}</h3>
        <p className="card-excerpt">{excerpt}</p>
        <time className="card-date">{date}</time>
      </div>
      <Link href={`/karya/${karya.id}`} className="card-link" aria-label={`Baca ${karya.judul}`} />
    </article>
  );
}
