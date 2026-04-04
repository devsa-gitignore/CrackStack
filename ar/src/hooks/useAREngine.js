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
  const detectStartTimeRef = useRef(null);

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
            console.error('Unable to load wardrobe item:', garment.image);
          }
        };
        fetchImg();
      }
    });
  }, [wardrobe]);

  // ── Debug skeleton renderer ─────────────────────────────────────────────
  const drawDebugSkeleton = useCallback((ctx, keypoints) => {
    if (!keypoints) return;

    const { 
      leftShoulder, rightShoulder, leftHip, rightHip, shoulderMid, hipMid,
      arms, nose, leftEye, rightEye, leftEar, rightEar, headTop,
      leftKnee, rightKnee, leftAnkle, rightAnkle 
    } = keypoints;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw connections (Lines)
    const drawLine = (p1, p2, color, dashed = false) => {
      if (!p1 || !p2) return;
      ctx.strokeStyle = color;
      if (dashed) ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      if (dashed) ctx.setLineDash([]);
    };

    // Main Torso
    drawLine(leftShoulder, rightShoulder, '#00ff88');
    drawLine(leftHip, rightHip, '#ff6644');
    drawLine(leftShoulder, leftHip, '#00ff88');
    drawLine(rightShoulder, rightHip, '#00ff88');
    drawLine(shoulderMid, hipMid, '#4488ff', true);

    // Face/Head
    if (nose) {
      drawLine(nose, leftEye, '#ffffff80');
      drawLine(nose, rightEye, '#ffffff80');
      drawLine(leftEye, leftEar, '#ffffff80');
      drawLine(rightEye, rightEar, '#ffffff80');
      drawLine(shoulderMid, nose, '#4488ff80', true);
    }

    // Arms
    if (arms.left?.elbow) {
      drawLine(leftShoulder, arms.left.elbow, '#00ff88');
      drawLine(arms.left.elbow, arms.left.wrist, '#00ff88');
    }
    if (arms.right?.elbow) {
      drawLine(rightShoulder, arms.right.elbow, '#00ff88');
      drawLine(arms.right.elbow, arms.right.wrist, '#00ff88');
    }

    // Legs
    if (leftKnee) drawLine(leftHip, leftKnee, '#ff6644');
    if (leftAnkle) drawLine(leftKnee, leftAnkle, '#ff6644');
    if (rightKnee) drawLine(rightHip, rightKnee, '#ff6644');
    if (rightAnkle) drawLine(rightKnee, rightAnkle, '#ff6644');

    // 2. Draw dots
    const drawDot = (point, color, size = 6) => {
      if (!point) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const points = [
      { p: leftShoulder, c: '#00ff88' }, { p: rightShoulder, c: '#00ff88' },
      { p: leftHip, c: '#ff6644' }, { p: rightHip, c: '#ff6644' },
      { p: nose, c: '#ffffff' }, { p: headTop, c: '#indigo-400' },
      { p: arms.left?.wrist, c: '#00ff88' }, { p: arms.right?.wrist, c: '#00ff88' },
      { p: leftAnkle, c: '#ff6644' }, { p: rightAnkle, c: '#ff6644' },
    ];

    points.forEach(({ p, c }) => drawDot(p, c));

    // Metrics overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(8, 8, 220, 95);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`BODY METRICS LOCKED`, 16, 28);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Shoulders: ${keypoints.shoulderWidth.toFixed(0)}px`, 16, 48);
    ctx.fillText(`Torso H:   ${keypoints.torsoHeight.toFixed(0)}px`, 16, 64);
    ctx.fillText(`Leg H:     ${keypoints.legHeight.toFixed(0)}px`, 16, 80);
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
              if (!detectStartTimeRef.current) {
                detectStartTimeRef.current = Date.now();
              }
              const elapsed = Date.now() - detectStartTimeRef.current;
              const countdownSecs = Math.ceil((3000 - elapsed) / 1000);

              if (countdownSecs > 0) {
                // Dim screen and show countdown
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, w, h);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 120px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(countdownSecs.toString(), w / 2, h / 2);
                
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#10b981'; // Emerald 500
                ctx.fillText("Stand back to capture your body outline...", w / 2, h / 2 + 100);
                
                // Reset text align
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
                
                // Draw skeleton partially transparent to help alignment
                ctx.globalAlpha = 0.5;
                if (showSkeleton) drawDebugSkeleton(ctx, keypoints);
                ctx.globalAlpha = 1.0;

                // Skip drawing garments until captured
                animFrameRef.current = requestAnimationFrame(renderFrame);
                return;
              }

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

              // 2. AUTO CAPTURE BASE SILHOUETTE! (Pure: Skeleton + Video, No Cloth)
              if (onBaseCapture && !contextExtractedRef.current) {
                // Temporarily draw skeleton if enabled
                if (showSkeleton) drawDebugSkeleton(ctx, keypoints);
                
                // Capture the CLEAN frame now!
                onBaseCapture(ctx.canvas.toDataURL('image/png'));
                
                // Clear the canvas and redraw the video to remove the skeleton before garments are drawn
                // (Garments should be drawn over video, then skeleton drawn ON TOP for final view)
                ctx.save();
                ctx.translate(w, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, w, h);
                ctx.restore();
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

          // ── CATEGORY VISIBILITY FILTER ──────────────────
          const isCategoryAvailable = (cat, k) => {
            switch (cat) {
              case 'over-head': return !!k.headTop;
              case 'face':      return !!k.leftEye && !!k.rightEye; // Require both eyes for precise glasses fit/scaling
              case 'torso':     return !!k.leftShoulder && !!k.rightShoulder;
              case 'wrists':    return (!!k.arms?.left?.wrist && !!k.arms?.left?.elbow) || (!!k.arms?.right?.wrist && !!k.arms?.right?.elbow);
              case 'legs':      return !!k.leftHip && !!k.rightHip && (!!k.leftAnkle || !!k.leftKnee);
              case 'feet':      return !!k.leftAnkle || !!k.rightAnkle;
              case 'full-body': return !!k.leftShoulder && !!k.rightShoulder && !!k.leftHip && !!k.rightHip;
              default: return true;
            }
          };

          sortedWardrobe.forEach((garment) => {
            if (!garment.isVisible) return;
            const clothImg = wardrobeCacheRef.current[garment.id];
            
            if (clothImg) {
              const tmpl = TEMPLATES[garment.type] || TEMPLATES.tshirt;
              
              // Only draw if the specific body region is visible in the frame
              if (!isCategoryAvailable(tmpl.category, keypoints)) return;

              if (useWarp) {
                drawWarpedCloth(ctx, clothImg, keypoints, tmpl, garment.targetPins);
              } else {
                drawFlatCloth(ctx, clothImg, keypoints, tmpl);
              }
            }
          });

          // Draw final skeleton on top of everything for the LIVE view
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
