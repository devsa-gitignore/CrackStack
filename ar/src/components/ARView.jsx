import { useState } from 'react';
import useCamera from '../hooks/useCamera';
import usePose from '../hooks/usePose';
import useAREngine from '../hooks/useAREngine';

/**
 * ARView — Live webcam AR try-on component.
 *
 * This is a THIN UI SHELL. All AR logic lives in hooks:
 *   - useCamera      → webcam stream management
 *   - usePose        → MediaPipe pose detection
 *   - useAREngine    → render loop (video → pose → cloth warp)
 *
 * You can completely redesign this component's UI without touching any AR code.
 */
export default function ARView({ wardrobe = [], useWarp = true, onUserContextUpdate, onBaseCapture }) {
  const [showSkeleton, setShowSkeleton] = useState(true); // AI Scan often defaults to skeleton on for coolness
  const [scanComplete, setScanComplete] = useState(false);

  // ── AR hooks (pure logic, zero UI) ──────────────────────────────────────
  const { videoRef, cameraReady, cameraError, cameraStarted, startCamera, stopCamera, startVideoFile, isVideoFile } = useCamera();
  const { landmarkerReady, loadingProgress, detect } = usePose();
  const { canvasRef } = useAREngine({
    videoRef,
    isActive: cameraReady && landmarkerReady,
    detect,
    wardrobe,
    useWarp,
    showSkeleton,
    onUserContextUpdate,
    onBaseCapture: (dataUrl) => {
       onBaseCapture(dataUrl);
       setScanComplete(true);
       setTimeout(() => setScanComplete(false), 2000);
    },
  });

  // Snapshot functionality
  const handleSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ar-fashion-snapshot-${Date.now()}.png`;
    link.click();
  };

  // ── UI: Camera error ────────────────────────────────────────────────────
  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <div className="text-6xl mb-4">📷</div>
        <h2 className="text-xl font-semibold mb-2">Camera Access Denied</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please allow camera access in your browser settings to use the live AR try-on.
        </p>
        <p className="text-gray-500 text-sm mt-4 font-mono">{cameraError}</p>
      </div>
    );
  }

  // ── UI: Start Camera splash ─────────────────────────────────────────────
  if (!cameraStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white p-8">
        {/* Decorative background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[500px] h-[500px] rounded-full border border-indigo-500/10 animate-pulse" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-indigo-400/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-indigo-300/10 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Camera icon with glow */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 tracking-tight">Ready for AR Try-On</h2>
          <p className="text-gray-400 text-center max-w-sm mb-8 text-sm leading-relaxed">
            Your camera will be used to detect your pose and overlay clothing in real-time.
            No images are stored or sent to any server.
          </p>

          <button
            id="start-camera-btn"
            onClick={startCamera}
            className="group relative px-8 py-3.5 rounded-2xl font-semibold text-white text-base
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-500 hover:to-purple-500
              shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
              transition-all duration-300 hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Start Live Camera
            </span>
          </button>

          <div className="flex items-center my-6 w-full max-w-sm">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="px-3 text-[10px] font-black uppercase text-gray-500 tracking-widest">OR USE VIDEO FILE</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          <label className="cursor-pointer group relative px-8 py-3 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded-xl font-bold text-xs transition-all flex items-center gap-2">
            <span>📁 Upload MP4 / MOV Video</span>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) startVideoFile(e.target.files[0]);
              }} 
            />
          </label>

          <p className="text-gray-600 text-[10px] mt-6 italic">
            Videos should be recorded from a straight-on perspective for best results.
          </p>
        </div>
      </div>
    );
  }

  // ── UI: Active AR view ──────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden video element — data source only */}
      <video ref={videoRef} className="hidden" playsInline muted loop={isVideoFile} />
      
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
         <button onClick={stopCamera} className="bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600/30 transition">
           Exit AR
         </button>
      </div>

      {/* Main canvas — the only visible element */}
      <canvas ref={canvasRef} className="w-full h-full object-contain" />

      {/* Loading overlay */}
      {(!cameraReady || !landmarkerReady) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-medium">{loadingProgress}</p>
          {!cameraReady && <p className="text-gray-400 text-sm mt-1">Waiting for camera...</p>}
        </div>
      )}

      {/* Scan Complete Animation Overlay */}
      {scanComplete && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-emerald-500/10 backdrop-blur-[1px]">
          <div className="bg-emerald-600/90 text-white px-8 py-4 rounded-3xl font-black text-xl shadow-[0_0_50px_rgba(16,185,129,0.4)] border-2 border-emerald-400 animate-pulse flex items-center gap-4">
             <span className="text-3xl">⚡</span>
             <div className="flex flex-col items-start leading-tight">
                <span>SCAN SUCCESS</span>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-[0.2em] mt-1">Body Reference Locked</span>
             </div>
          </div>
        </div>
      )}

      {/* Action buttons panel */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-20">
        <button
          onClick={handleSnapshot}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all bg-indigo-600 border border-indigo-400 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
        >
          <span className="text-lg drop-shadow shadow-black">📸</span> Take Snapshot
        </button>

        <button
          onClick={() => setShowSkeleton((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-lg
            ${showSkeleton
              ? 'bg-green-500/90 text-white border border-green-400 shadow-green-500/20'
              : 'bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 border border-white/10'
            } backdrop-blur-md`}
        >
          {showSkeleton ? '🦴 SKELETON ON' : '🦴 SKELETON'}
        </button>
      </div>
    </div>
  );
}
