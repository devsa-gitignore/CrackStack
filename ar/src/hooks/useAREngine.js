import { useRef, useEffect, useCallback } from 'react';
import { extractKeypoints } from '../utils/landmarks';
import { drawWarpedCloth, drawFlatCloth } from '../utils/warp';
import { TEMPLATES } from '../utils/templates';
import { loadAndTrimImage } from '../utils/imageProcessor';

/**
 * useAREngine — Orchestrates the real-time AR render loop.
 *
 * Pure logic hook — no UI, no rendering decisions.
 * Handles: cloth image loading, render loop (video → canvas → pose → warp), debug skeleton.
 *
 * Usage:
 *   const { canvasRef, clothLoaded } = useAREngine({
 *     videoRef,         // from useCamera
 *     isActive,         // boolean: true when camera + pose model are ready
 *     detect,           // from usePose
 *     clothType,        // 'tshirt' | 'shirt' | 'jacket' | 'kurta'
 *     clothImageSrc,    // URL to the garment PNG
 *     useWarp,          // boolean
 *     showSkeleton,     // boolean
 *   });
 */
export default function useAREngine({
  videoRef,
  isActive,
  detect,
  wardrobe = [],
  useWarp = true,
  showSkeleton = false,
  onUserContextUpdate,
  onBaseCapture,
}) {
  const canvasRef = useRef(null);
  const wardrobeCacheRef = useRef({}); // Stores loaded image canvases by garment ID
  const animFrameRef = useRef(null);
  const contextExtractedRef = useRef(false);

  // ── Load ALL cloth images into cache ────────────────────────────────────────────────────
  useEffect(() => {
    wardrobe.forEach((garment) => {
      // If we don't have it cached yet, load it!
      if (!wardrobeCacheRef.current[garment.id] && garment.image) {
        const fetchImg = async () => {
          try {
            const trimmedCanvas = await loadAndTrimImage(garment.image);
            wardrobeCacheRef.current[garment.id] = trimmedCanvas;
          } catch (err) {
            console.error('Failed to load wardrobe item:', garment.image);
          }
        };
        fetchImg();
      }
    });
  }, [wardrobe]);

  // ── Debug skeleton renderer ─────────────────────────────────────────────
  const drawDebugSkeleton = useCallback((ctx, keypoints) => {
    if (!keypoints) return;

    const { leftShoulder, rightShoulder, leftHip, rightHip, shoulderMid, hipMid } = keypoints;

    // Shoulder line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftShoulder.x, leftShoulder.y);
    ctx.lineTo(rightShoulder.x, rightShoulder.y);
    ctx.stroke();

    // Hip line
    ctx.strokeStyle = '#ff6644';
    ctx.beginPath();
    ctx.moveTo(leftHip.x, leftHip.y);
    ctx.lineTo(rightHip.x, rightHip.y);
    ctx.stroke();

    // Torso center line
    ctx.strokeStyle = '#4488ff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(shoulderMid.x, shoulderMid.y);
    ctx.lineTo(hipMid.x, hipMid.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Landmark dots
    const points = [
      { point: leftShoulder, color: '#00ff88', label: 'LS' },
      { point: rightShoulder, color: '#00ff88', label: 'RS' },
      { point: leftHip, color: '#ff6644', label: 'LH' },
      { point: rightHip, color: '#ff6644', label: 'RH' },
    ];

    points.forEach(({ point, color, label }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(label, point.x + 12, point.y + 4);
    });

    // Metrics overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(8, 8, 260, 80);
    ctx.fillStyle = '#00ff88';
    ctx.font = '13px monospace';
    ctx.fillText(`Shoulder W: ${keypoints.shoulderWidth.toFixed(1)}px`, 16, 28);
    ctx.fillText(`Torso H: ${keypoints.torsoHeight.toFixed(1)}px`, 16, 46);
    ctx.fillText(`Angle: ${(keypoints.angle * 180 / Math.PI).toFixed(1)}°`, 16, 64);
    ctx.fillText(`Anchor: (${keypoints.anchorX.toFixed(0)}, ${keypoints.anchorY.toFixed(0)})`, 16, 82);
  }, []);

  // ── Main render loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;

    const video = videoRef?.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    function renderFrame() {
      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Mirror the video horizontally (selfie mode)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();

      // Detect pose
      const landmarks = detect(video);

      if (landmarks) {
        // Mirror x coordinates for selfie mode
        const mirroredLandmarks = landmarks.map((lm) => ({
          ...lm,
          x: 1 - lm.x,
        }));
        const keypoints = extractKeypoints(mirroredLandmarks, w, h);

        if (keypoints) {
          // Once per session, extract dimensions and actual skin tone
          if (onUserContextUpdate && !contextExtractedRef.current) {
            const nose = landmarks[0];
            if (nose && nose.visibility > 0.5) {
              const noseX = Math.floor((1 - nose.x) * w);
              const noseY = Math.floor(nose.y * h);
              let hex = '#e2b896'; // default fallback tone
              try {
                // We wrap this because if the video source is tainted (CORS), getImageData fails.
                const pixel = ctx.getImageData(noseX, noseY, 1, 1).data;
                hex = `#${pixel[0].toString(16).padStart(2,'0')}${pixel[1].toString(16).padStart(2,'0')}${pixel[2].toString(16).padStart(2,'0')}`;
              } catch (e) {}

              onUserContextUpdate({
                complexion: hex,
                dimensions: {
                  shoulderWidth: Math.round(keypoints.shoulderWidth),
                  torsoHeight: Math.round(keypoints.torsoHeight),
                  eyeDistance: Math.round(keypoints.eyeDistance),
                  ratio: (keypoints.torsoHeight / keypoints.shoulderWidth).toFixed(2)
                }
              });

              // 2. AUTO CAPTURE BASE SILHOUETTE!
              // Since we're currently in the middle of frame drawing, we capture a snapshot
              // of the canvas AFTER the skeleton logic (which happens next) or directly here.
              // We'll use a 100ms timeout to ensure the skeleton layer is also rendered if it's on.
              if (onBaseCapture) {
                setTimeout(() => {
                   onBaseCapture(ctx.canvas.toDataURL('image/png'));
                }, 100);
              }

              contextExtractedRef.current = true;
            }
          }

          // Draw cloth overlays (Bottoms first, then tops!)
          const sortedWardrobe = [...wardrobe].sort((a, b) => {
            const tmplA = TEMPLATES[a.type] || TEMPLATES.tshirt;
            const tmplB = TEMPLATES[b.type] || TEMPLATES.tshirt;
            if (tmplA.isBottom && !tmplB.isBottom) return -1;
            if (!tmplA.isBottom && tmplB.isBottom) return 1;
            return 0;
          });

          sortedWardrobe.forEach((garment) => {
            if (!garment.isVisible) return;
            const clothImg = wardrobeCacheRef.current[garment.id];
            
            if (clothImg) {
              const tmpl = TEMPLATES[garment.type] || TEMPLATES.tshirt;
              if (useWarp) {
                drawWarpedCloth(ctx, clothImg, keypoints, tmpl, garment.targetPins);
              } else {
                drawFlatCloth(ctx, clothImg, keypoints, tmpl);
              }
            }
          });

          // Debug skeleton
          if (showSkeleton) {
            drawDebugSkeleton(ctx, keypoints);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, videoRef, detect, wardrobe, useWarp, showSkeleton]);

  return {
    canvasRef,
    clothLoaded: Object.keys(wardrobeCacheRef.current).length > 0,
  };
}
