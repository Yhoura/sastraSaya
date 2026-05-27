'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, type Karya } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<'cerpen' | 'puisi'>('cerpen');
  const [ringkasan, setRingkasan] = useState('');
  const [konten, setKonten] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchKarya = async () => {
      const { data, error } = await supabase
        .from('karya')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const karya = data as Karya;
      setJudul(karya.judul);
      setKategori(karya.kategori);
      setRingkasan(karya.ringkasan || '');
      setKonten(karya.konten);
      setCurrentImageUrl(karya.image_url || null);
      setPublished(karya.published);
      setLoading(false);
    };

    if (id) {
      fetchKarya();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (!judul.trim() || !konten.trim() || konten === '<p><br></p>') {
      setMessage('Judul dan konten wajib diisi.');
      setMessageType('error');
      setSaving(false);
      return;
    }

    let image_url = currentImageUrl;
    
    // Upload new image if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        image_url = uploadData.url;
      } catch (uploadError) {
        setMessage('Gagal mengunggah gambar baru ke R2.');
        setMessageType('error');
        console.error(uploadError);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('karya')
      .update({
        judul: judul.trim(),
        kategori,
        ringkasan: ringkasan.trim() || null,
        konten: konten.trim(),
        image_url,
        published,
      })
      .eq('id', id);

    if (error) {
      setMessage('Gagal memperbarui karya. Silakan coba lagi.');
      setMessageType('error');
      console.error(error);
    } else {
      // Revalidate cache
      fetch('/api/revalidate', { method: 'POST' }).catch(console.error);

      setMessage('Karya berhasil diperbarui!');
      setMessageType('success');
      setTimeout(() => {
        router.push('/penulis');
      }, 1500);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Yakin ingin menghapus karya ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirmed) return;

    if (currentImageUrl) {
      const fileName = currentImageUrl.split('/').pop();
      if (fileName) {
        await fetch('/api/upload', {
          method: 'DELETE',
          body: JSON.stringify({ fileName }),
        }).catch(console.error);
      }
    }

    const { error } = await supabase.from('karya').delete().eq('id', id);
    if (error) {
      setMessage('Gagal menghapus karya.');
      setMessageType('error');
      console.error(error);
    } else {
      // Revalidate cache
      fetch('/api/revalidate', { method: 'POST' }).catch(console.error);
      router.push('/penulis');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="admin-error">
        <h2>Karya Tidak Ditemukan</h2>
        <p>Karya dengan ID tersebut tidak ditemukan atau sudah dihapus.</p>
        <button className="btn btn-primary" onClick={() => router.push('/penulis')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <h1 className="edit-title">✏️ Edit Karya</h1>
        <button onClick={handleDelete} className="btn btn-delete">
          🗑️ Hapus Karya
        </button>
      </div>

      {message && (
        <div className={`toast toast-${messageType}`}>
          {message}
        </div>
      )}

      <div className="upload-layout">
        <div className="upload-form-container">
          <form onSubmit={handleUpdate} className="upload-form">
            
            <div className="form-group">
              <label className="form-label" htmlFor="image">Gambar Sampul (Biarkan kosong jika tidak ingin mengubah)</label>
              {currentImageUrl && !imageFile && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={currentImageUrl} alt="Current Cover" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                </div>
              )}
              <input
                id="image"
                type="file"
                accept="image/*"
                className="form-input form-file"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="judul">Judul</label>
              <input
                id="judul"
                type="text"
                className="form-input"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                placeholder="Masukkan judul karya"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="kategori">Kategori</label>
              <select
                id="kategori"
                className="form-input form-select"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as 'cerpen' | 'puisi')}
              >
                <option value="cerpen">Cerpen</option>
                <option value="puisi">Puisi</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ringkasan">Ringkasan (opsional)</label>
              <input
                id="ringkasan"
                type="text"
                className="form-input"
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Deskripsi singkat karya"
              />
            </div>

            <div className="form-group quill-group">
              <label className="form-label" htmlFor="konten">Konten</label>
              <div className="quill-container">
                <ReactQuill 
                  theme="snow" 
                  value={konten} 
                  onChange={setKonten} 
                  placeholder="Tulis karya Anda di sini..."
                />
              </div>
            </div>

            <div className="form-group form-checkbox-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span>Terbitkan sekarang</span>
              </label>
              <p className="form-hint">
                {published
                  ? 'Karya akan langsung tampil di website.'
                  : 'Karya akan disimpan sebagai draf.'}
              </p>
            </div>

            <div className="edit-actions">
              <button type="submit" className="btn btn-primary upload-btn" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Perbarui Karya'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/penulis')}
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        <div className="preview-container">
          <div className="preview-header">
            <h2 className="preview-heading">Pratinjau</h2>
          </div>
          <div className="preview-content">
            {!konten && !judul ? (
              <p className="preview-placeholder">Mulai menulis untuk melihat pratinjau...</p>
            ) : (
              <>
                {(imageFile || currentImageUrl) && (
                  <div className="preview-image-container" style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : (currentImageUrl as string)} 
                      alt="Preview Sampul" 
                      style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                {judul && <h1 className="preview-title">{judul}</h1>}
                {kategori && (
                  <span className={`badge badge-kategori badge-${kategori}`}>{kategori}</span>
                )}
                {ringkasan && <p className="preview-ringkasan">{ringkasan}</p>}
                <div className="preview-konten ql-editor" dangerouslySetInnerHTML={{ __html: konten }}></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
