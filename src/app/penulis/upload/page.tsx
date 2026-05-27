'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function UploadPage() {
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<'cerpen' | 'puisi'>('cerpen');
  const [ringkasan, setRingkasan] = useState('');
  const [konten, setKonten] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!judul.trim() || !konten.trim() || konten === '<p><br></p>') {
      setMessage('Judul dan konten wajib diisi.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    let image_url = null;
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
        setMessage('Gagal mengunggah gambar ke R2.');
        setMessageType('error');
        console.error(uploadError);
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('karya').insert([
      {
        judul: judul.trim(),
        kategori,
        ringkasan: ringkasan.trim() || null,
        konten: konten.trim(),
        image_url,
        published,
      },
    ]);

    if (error) {
      setMessage('Gagal menyimpan karya. Silakan coba lagi.');
      setMessageType('error');
      console.error(error);
      setLoading(false);
    } else {
      setMessage('Karya berhasil disimpan!');
      setMessageType('success');
      setTimeout(() => {
        router.push('/penulis');
      }, 1500);
    }
  };

  const renderPreview = () => {
    if (!konten && !judul) {
      return <p className="preview-placeholder">Mulai menulis untuk melihat pratinjau...</p>;
    }

    return (
      <>
        {imageFile && (
          <div className="preview-image-container" style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={URL.createObjectURL(imageFile)} alt="Preview Sampul" style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }} />
          </div>
        )}
        {judul && <h1 className="preview-title">{judul}</h1>}
        {kategori && (
          <span className={`badge badge-kategori badge-${kategori}`}>{kategori}</span>
        )}
        {ringkasan && <p className="preview-ringkasan">{ringkasan}</p>}
        <div className="preview-konten ql-editor" dangerouslySetInnerHTML={{ __html: konten }}></div>
      </>
    );
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1 className="upload-title">✍️ Tulis Karya Baru</h1>
      </div>

      {message && (
        <div className={`toast toast-${messageType}`}>
          {message}
        </div>
      )}

      <div className="upload-layout">
        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label className="form-label" htmlFor="image">Gambar Sampul</label>
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

            <button type="submit" className="btn btn-primary upload-btn" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Karya'}
            </button>
          </form>
        </div>

        <div className="preview-container">
          <div className="preview-header">
            <h2 className="preview-heading">Pratinjau</h2>
          </div>
          <div className="preview-content">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
