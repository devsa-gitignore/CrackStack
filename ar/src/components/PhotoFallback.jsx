import { useRef, useState, useCallback } from 'react';
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
export default function PhotoFallback({ clothType = 'tshirt', clothImageSrc = '/mock-tshirt.png' }) {
  const fileInputRef = useRef(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ── AR hooks (pure logic, zero UI) ──────────────────────────────────────
  const { landmarkerReady, loadingProgress, detectImage } = usePose();
  const { canvasRef, processPhoto } = usePhotoProcessor({
    detectImage,
    clothType,
    clothImageSrc,
  });

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
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6">
      {/* Upload area */}
      {!photoLoaded && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-lg aspect-[4/3] border-2 border-dashed border-gray-600 rounded-2xl 
                     flex flex-col items-center justify-center cursor-pointer
                     hover:border-indigo-500 hover:bg-indigo-500/5 transition-all duration-300"
        >
          {processing ? (
            <>
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-white font-medium">Detecting pose...</p>
            </>
          ) : !landmarkerReady ? (
            <>
              <div className="w-10 h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400">{loadingProgress}</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">📸</div>
              <p className="text-white font-medium">Upload a Photo</p>
              <p className="text-gray-400 text-sm mt-1">Full upper body, facing camera</p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm max-w-lg text-center">
          {error}
        </div>
      )}

      {/* Canvas (result) */}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-[80vh] object-contain rounded-xl ${photoLoaded ? '' : 'hidden'}`}
      />

      {/* Re-upload button */}
      {photoLoaded && (
        <button
          onClick={() => {
            setPhotoLoaded(false);
            setError(null);
            fileInputRef.current.value = '';
          }}
          className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg 
                     font-medium transition-colors"
        >
          Try another photo
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
