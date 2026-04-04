import { useRef, useState, useCallback, useEffect } from 'react';
import usePose from '../hooks/usePose';
import usePhotoProcessor from '../hooks/usePhotoProcessor';

/**
 * PhotoFallback — Static image AR try-on mode.
 *
 * This is a THIN UI SHELL. All processing logic lives in:
 *   - usePose            → MediaPipe pose detection
 *   - usePhotoProcessor  → photo processing (detect + cloth warp)
 *
 * You can completely redesign this component's UI without touching any AR code.
 */
export default function PhotoFallback({ garment }) {
  const clothType = garment?.type || 'tshirt';
  const clothImageSrc = garment?.image || '/mock-tshirt.png';
  const fileInputRef = useRef(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ── AR hooks (pure logic, zero UI) ──────────────────────────────────────
  const { landmarkerReady, loadingProgress, detectImage } = usePose();
  const { canvasRef, processPhoto, redraw } = usePhotoProcessor({
    detectImage,
    clothType,
    clothImageSrc,
  });

  // Re-draw when garment changes (without re-upload)
  useEffect(() => {
    if (photoLoaded) redraw();
  }, [garment, photoLoaded, redraw]);

  // ── Handle file selection ───────────────────────────────────────────────
  const handleFileSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setProcessing(true);
      setError(null);

      const result = await processPhoto(file);

      if (result.success) {
        setPhotoLoaded(true);
      } else {
        setError(result.error);
      }

      setProcessing(false);
    },
    [processPhoto]
  );

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-6 font-sans">
      {/* Upload area */}
      {!photoLoaded && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-lg aspect-[4/3] border-2 border-dashed border-white/5 rounded-2xl 
                     flex flex-col items-center justify-center cursor-pointer
                     hover:border-white/20 hover:bg-white/5 transition-all duration-300"
        >
          {processing ? (
            <>
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
              <p className="text-white text-[10px] font-black uppercase tracking-[0.22em] animate-pulse">Syncing environment</p>
            </>
          ) : !landmarkerReady ? (
            <>
              <div className="w-10 h-10 border-4 border-white/10 border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.22em]">{loadingProgress}</p>
            </>
          ) : (
            <>
              <p className="text-white text-[12px] font-black uppercase tracking-[0.22em]">Import analysis target</p>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.1em] mt-3">Full upper body visibility required</p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest max-w-lg text-center">
          Protocol Error: {error}
        </div>
      )}

      {/* Canvas (result) */}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/5 shadow-2xl ${photoLoaded ? '' : 'hidden'}`}
      />

      {/* Re-upload button */}
      {photoLoaded && (
        <button
          onClick={() => {
            setPhotoLoaded(false);
            setError(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="mt-6 px-10 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl 
                     text-[10px] font-black uppercase tracking-[0.22em] transition-all shadow-xl"
        >
          Reset Session
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
