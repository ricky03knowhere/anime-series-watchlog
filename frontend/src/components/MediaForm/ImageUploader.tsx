import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { uploadApi } from '@/api/uploadApi';
import { useToast } from '@/contexts/ToastContext';

interface ImageUploaderProps {
  label: string;
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  bucket: 'media-posters' | 'media-backdrops';
  aspectClass?: string;
  optional?: boolean;
}

export function ImageUploader({
  label,
  imageUrl,
  onImageChange,
  bucket,
  aspectClass = 'aspect-[2/3]',
  optional = false,
}: ImageUploaderProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('Maximum image size is 1MB', 'error');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, and WEBP images are allowed', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file, bucket);
      if (res.data?.url) {
        onImageChange(res.data.url);
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const isPoster = bucket === 'media-posters';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
          {label}{optional && ' (Optional)'}
        </label>
        {/* Mode Selector */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('file')}
            className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
            style={{
              background: mode === 'file' ? 'var(--color-primary-600)' : 'transparent',
              color: mode === 'file' ? 'white' : 'var(--text-muted)',
            }}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
            style={{
              background: mode === 'url' ? 'var(--color-primary-600)' : 'transparent',
              color: mode === 'url' ? 'white' : 'var(--text-muted)',
            }}
          >
            Image URL
          </button>
        </div>
      </div>

      {imageUrl ? (
        <div
          className={`relative ${aspectClass} max-h-[180px] rounded-xl border overflow-hidden`}
          style={{ borderColor: 'var(--border)' }}
        >
          <img src={imageUrl} alt={`${label} preview`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black"
            title="Remove Image"
          >
            <X size={14} />
          </button>
        </div>
      ) : mode === 'url' ? (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="url"
              placeholder={`https://example.com/${isPoster ? 'poster' : 'backdrop'}.jpg`}
              onChange={(e) => onImageChange(e.target.value || null)}
              className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border outline-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {isPoster
              ? 'Paste a direct image URL link (e.g. from MyAnimeList or Unsplash)'
              : 'Paste a direct hero backdrop image URL link'}
          </p>
        </div>
      ) : (
        <div
          className={`relative ${aspectClass} max-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center overflow-hidden transition-colors`}
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
            {isPoster ? (
              <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <Upload size={24} style={{ color: 'var(--text-muted)' }} />
            )}
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {isUploading ? 'Uploading...' : `Upload ${isPoster ? 'Poster' : 'Backdrop'} File`}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {isPoster ? 'JPG, PNG, WEBP < 1MB' : 'Hero backdrop image'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
