import { useRef, useCallback, useEffect, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const SMOOTHING_ALPHA = 0.35;

/**
 * Custom hook that initializes MediaPipe PoseLandmarker and provides
 * landmark detection with exponential smoothing.
 * 
 * Usage:
 *   const { landmarkerReady, detect, detectImage } = usePose();
 *   // For video: call detect(videoElement) in rAF loop
 *   // For image: call detectImage(imageElement) once
 */
export default function usePose() {
  const landmarkerRef = useRef(null);
  const previousLandmarksRef = useRef(null);
  const [landmarkerReady, setLandmarkerReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('Initializing...');

  // Initialize PoseLandmarker on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoadingProgress('Loading vision WASM...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );

        if (cancelled) return;

        setLoadingProgress('Loading pose model...');
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (cancelled) return;

        landmarkerRef.current = landmarker;
        setLandmarkerReady(true);
        setLoadingProgress('Ready');
      } catch (err) {
        console.error('Failed to initialize PoseLandmarker:', err);
        setLoadingProgress(`Error: ${err.message}`);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  /**
   * Apply exponential smoothing to reduce landmark jitter.
   */
  const smooth = useCallback((currentLandmarks) => {
    const prev = previousLandmarksRef.current;

    if (!prev || prev.length !== currentLandmarks.length) {
      // First frame or landmark count changed — no smoothing
      previousLandmarksRef.current = currentLandmarks.map((lm) => ({ ...lm }));
      return currentLandmarks;
    }

    const smoothed = currentLandmarks.map((lm, i) => ({
      x: SMOOTHING_ALPHA * lm.x + (1 - SMOOTHING_ALPHA) * prev[i].x,
      y: SMOOTHING_ALPHA * lm.y + (1 - SMOOTHING_ALPHA) * prev[i].y,
      z: lm.z, // z is less critical, don't smooth it
      visibility: lm.visibility,
    }));

    previousLandmarksRef.current = smoothed.map((lm) => ({ ...lm }));
    return smoothed;
  }, []);

  /**
   * Detect pose in a video frame (call inside requestAnimationFrame loop).
   * Returns smoothed landmarks array or null.
   */
  const detect = useCallback(
    (videoElement) => {
      if (!landmarkerRef.current || !videoElement || videoElement.readyState < 2) {
        return null;
      }

      try {
        const result = landmarkerRef.current.detectForVideo(
          videoElement,
          performance.now()
        );

        if (result.landmarks && result.landmarks.length > 0) {
          return smooth(result.landmarks[0]);
        }
      } catch (err) {
        // Silently ignore detection errors (can happen on frame timing issues)
      }

      return null;
    },
    [smooth]
  );

  /**
   * Detect pose in a static image (single-shot, no smoothing).
   * Must temporarily switch to IMAGE mode.
   */
  const detectImage = useCallback(async (imageElement) => {
    if (!landmarkerRef.current) return null;

    try {
      // Switch to IMAGE mode
      landmarkerRef.current.setOptions({ runningMode: 'IMAGE' });

      const result = landmarkerRef.current.detect(imageElement);

      // Switch back to VIDEO mode for potential future use
      landmarkerRef.current.setOptions({ runningMode: 'VIDEO' });

      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0];
      }
    } catch (err) {
      console.error('Image detection failed:', err);
      // Ensure we switch back to VIDEO mode
      try {
        landmarkerRef.current.setOptions({ runningMode: 'VIDEO' });
      } catch (_) { /* ignore */ }
    }

    return null;
  }, []);

  return {
    landmarkerReady,
    loadingProgress,
    detect,
    detectImage,
  };
}
