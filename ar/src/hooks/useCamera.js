import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * useCamera — Manages webcam stream lifecycle.
 *
 * Pure logic hook — no UI, no rendering.
 * Start/stop camera on demand, provides stream status and errors.
 *
 * Usage:
 *   const { videoRef, cameraReady, cameraError, startCamera, stopCamera } = useCamera();
 */
export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = useCallback(() => {
    setCameraStarted(true);
    setCameraError(null);
  }, []);

  const stopCamera = useCallback(() => {
    setCameraStarted(false);
    setCameraReady(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize webcam stream when cameraStarted becomes true
  useEffect(() => {
    if (!cameraStarted) return;

    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;

        // Wait for video metadata to load before playing
        await new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.addEventListener('loadeddata', resolve, { once: true });
          }
        });

        if (cancelled) return;

        try {
          await video.play();
        } catch (playErr) {
          if (playErr.name === 'AbortError') {
            console.log('Video play interrupted (expected during re-mount)');
            return;
          }
          throw playErr;
        }

        if (!cancelled) {
          setCameraReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Camera access failed:', err);
          setCameraError(err.message);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraStarted]);

  return {
    videoRef,
    cameraReady,
    cameraError,
    cameraStarted,
    startCamera,
    stopCamera,
  };
}
