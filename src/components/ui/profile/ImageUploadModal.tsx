import { useRef, useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '@/components/ui/common/Button';
import { authService } from '@/lib/authService';
import { extractApiError } from '@/lib/apiErrors';

export type UploadImageType = 'profile' | 'banner' | 'background';

interface Props {
  type: UploadImageType;
  username: string;
  onSuccess: (imageUrl: string) => void;
  onClose: () => void;
}

// Display size of the crop window
const CROP_DISPLAY: Record<UploadImageType, { w: number; h: number }> = {
  profile:    { w: 240, h: 240 },
  banner:     { w: 360, h: 120 },
  background: { w: 360, h: 203 },
};

// Final upload target size
const TARGET_SIZE: Record<UploadImageType, { w: number; h: number }> = {
  profile:    { w: 400,  h: 400  },
  banner:     { w: 1500, h: 500  },
  background: { w: 1920, h: 1080 },
};

const TITLE: Record<UploadImageType, string> = {
  profile:    'Upload Profile Picture',
  banner:     'Upload Banner Image',
  background: 'Upload Background Image',
};

const HINT: Record<UploadImageType, string> = {
  profile:    'Recommended 400×400px · Max 2MB · JPG, PNG, WebP',
  banner:     'Recommended 1500×500px · Max 1MB · JPG, PNG, WebP',
  background: 'Recommended 1920×1080px · Max 2MB · JPG, PNG, WebP',
};

const ACCEPTED = 'image/jpeg,image/png,image/webp';

export default function ImageUploadModal({ type, username, onSuccess, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLImageElement>(null);

  const [preview,     setPreview]     = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [offset,      setOffset]      = useState({ x: 0, y: 0 });
  const [isDragging,  setIsDragging]  = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0 });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const { w: cropW, h: cropH } = CROP_DISPLAY[type];

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    setPreview(URL.createObjectURL(f));
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const scale = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight);
    const dw = Math.round(img.naturalWidth  * scale);
    const dh = Math.round(img.naturalHeight * scale);
    setDisplaySize({ w: dw, h: dh });
    setOffset({ x: Math.round((cropW - dw) / 2), y: Math.round((cropH - dh) / 2) });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !displaySize.w) return;
    const newX = Math.min(0, Math.max(cropW - displaySize.w, e.clientX - dragOrigin.current.x));
    const newY = Math.min(0, Math.max(cropH - displaySize.h, e.clientY - dragOrigin.current.y));
    setOffset({ x: newX, y: newY });
  }

  function onPointerUp() { setIsDragging(false); }

  async function getCroppedFile(): Promise<File> {
    const img = imgRef.current!;
    const { w: targetW, h: targetH } = TARGET_SIZE[type];
    const scaleX = img.naturalWidth  / displaySize.w;
    const scaleY = img.naturalHeight / displaySize.h;
    const srcX = (-offset.x) * scaleX;
    const srcY = (-offset.y) * scaleY;
    const srcW = cropW * scaleX;
    const srcH = cropH * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width  = targetW;
    canvas.height = targetH;
    canvas.getContext('2d')!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(new File([blob], 'upload.webp', { type: 'image/webp' })) : reject(new Error('export failed')),
        'image/webp', 0.9
      );
    });
  }

  async function handleUpload() {
    if (!preview || !imgRef.current) return;
    setLoading(true);
    setError('');
    try {
      const file = await getCroppedFile();
      const uploadFn =
        type === 'profile'    ? authService.uploadProfileImage :
        type === 'banner'     ? authService.uploadBannerImage  :
                                authService.uploadBackgroundImage;
      const result = await uploadFn.call(authService, username, file);
      onSuccess(result.imageUrl);
      onClose();
    } catch (err) {
      setError(extractApiError(err, 'Upload failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-[10px] shadow-card w-[440px] flex flex-col gap-4 p-6 relative font-gabarito">
        <button
          className="absolute top-3 right-3 text-text-muted hover:text-text-main transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h2 className="text-[20px] font-semibold text-text-main">{TITLE[type]}</h2>
        <p className="text-xs text-text-muted -mt-2">{HINT[type]}</p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        {!preview ? (
          /* Drop zone */
          <div
            className="border-2 border-dashed border-border rounded-[5px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
            style={{ height: cropH + 40 }}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={28} className="text-text-muted" />
            <span className="text-sm text-text-muted">Click to select an image</span>
          </div>
        ) : (
          /* Crop tool */
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative overflow-hidden rounded-[5px] border border-border select-none"
              style={{ width: cropW, height: cropH, cursor: isDragging ? 'grabbing' : 'grab' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <img
                ref={imgRef}
                src={preview}
                alt="crop preview"
                draggable={false}
                onLoad={onImageLoad}
                style={{
                  position: 'absolute',
                  left: offset.x,
                  top:  offset.y,
                  width:  displaySize.w || 'auto',
                  height: displaySize.h || 'auto',
                  userSelect: 'none',
                }}
              />
            </div>
            <p className="text-xs text-text-muted">Drag to reposition</p>
            <button
              className="text-xs text-text-muted hover:text-primary underline"
              onClick={() => { setPreview(null); setDisplaySize({ w: 0, h: 0 }); inputRef.current?.click(); }}
            >
              Change image
            </button>
          </div>
        )}

        {error && <p className="text-xs text-status-red text-center">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button className="text-sm text-text-muted hover:text-text-main" onClick={onClose}>Cancel</button>
          <Button variant="amber" disabled={!preview || loading} onClick={handleUpload}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
