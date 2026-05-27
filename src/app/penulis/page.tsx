'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Karya } from '@/lib/supabase';

export default function DashboardPage() {
  const [karyaList, setKaryaList] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchKarya = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('karya')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Gagal memuat data karya.');
      console.error(error);
    } else {
      setKaryaList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKarya();
  }, []);

  const handleDelete = async (id: string, judul: string, imageUrl: string | null) => {
    const confirmed = window.confirm(`Yakin ingin menghapus "${judul}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) return;

    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await fetch('/api/upload', {
          method: 'DELETE',
          body: JSON.stringify({ fileName }),
        }).catch(console.error);
      }
    }

    const { error } = await supabase.from('karya').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus karya.');
      console.error(error);
    } else {
      // Revalidate cache
      fetch('/api/revalidate', { method: 'POST' }).catch(console.error);
      fetchKarya();
    }
  };

  const totalKarya = karyaList.length;
  const cerpenCount = karyaList.filter((k) => k.kategori === 'cerpen').length;
  const puisiCount = karyaList.filter((k) => k.kategori === 'puisi').length;
  const publishedCount = karyaList.filter((k) => k.published).length;
  const draftCount = karyaList.filter((k) => !k.published).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchKarya}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <Link href="/penulis/upload" className="btn btn-primary">
          ✍️ Tulis Karya Baru
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalKarya}</div>
          <div className="stat-label">Total Karya</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{cerpenCount}</div>
          <div className="stat-label">Cerpen</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{puisiCount}</div>
          <div className="stat-label">Puisi</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{publishedCount}</div>
          <div className="stat-label">Diterbitkan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{draftCount}</div>
          <div className="stat-label">Draf</div>
        </div>
      </div>

      <div className="table-container">
        <h2 className="table-title">Semua Karya</h2>
        {karyaList.length === 0 ? (
          <div className="table-empty">
            <p>Belum ada karya. Mulai menulis sekarang!</p>
            <Link href="/penulis/upload" className="btn btn-primary">
              ✍️ Tulis Karya Pertama
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {karyaList.map((karya) => (
                  <tr key={karya.id}>
                    <td className="table-judul">{karya.judul}</td>
                    <td>
                      <span className={`badge badge-kategori badge-${karya.kategori}`}>
                        {karya.kategori}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${karya.published ? 'badge-published' : 'badge-draft'}`}>
                        {karya.published ? 'Diterbitkan' : 'Draf'}
                      </span>
                    </td>
                    <td className="table-date">{formatDate(karya.created_at)}</td>
                    <td className="table-actions">
                      <Link href={`/penulis/edit/${karya.id}`} className="btn btn-sm btn-edit">
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(karya.id, karya.judul, karya.image_url)}
                        className="btn btn-sm btn-delete"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
