import { useRef, useCallback } from 'react';
import { extractKeypoints } from '../utils/landmarks';
import { drawWarpedCloth } from '../utils/warp';
import { TEMPLATES } from '../utils/templates';

/**
 * usePhotoProcessor — Processes a static photo for AR try-on.
 *
 * Pure logic hook — no UI, no rendering decisions.
 * Call processPhoto(file) with a File object, it returns a result or error.
 *
 * Usage:
 *   const { canvasRef, processPhoto } = usePhotoProcessor({
 *     detectImage,      // from usePose
 *     clothType,
 *     clothImageSrc,
 *   });
 */
export default function usePhotoProcessor({
  detectImage,
  clothType = 'tshirt',
  clothImageSrc = '/mock-tshirt.png',
}) {
  const canvasRef = useRef(null);
  const clothImgRef = useRef(null);

  const template = TEMPLATES[clothType] || TEMPLATES.tshirt;

  /**
   * Load the cloth image. Called internally before processing.
   */
  const ensureClothLoaded = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (clothImgRef.current?.src === clothImageSrc && clothImgRef.current?.complete) {
        resolve(clothImgRef.current);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = clothImageSrc;
      img.onload = () => {
        clothImgRef.current = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error('Failed to load cloth image'));
    });
  }, [clothImageSrc]);

  /**
   * Process a photo file: detect pose, draw cloth overlay.
   *
   * @param {File} file — image file from <input type="file">
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const processPhoto = useCallback(
    async (file) => {
      try {
        // Load the user's photo
        const photoUrl = URL.createObjectURL(file);
        const photo = new Image();
        photo.src = photoUrl;

        await new Promise((resolve, reject) => {
          photo.onload = resolve;
          photo.onerror = reject;
        });

        // Set up canvas
        const canvas = canvasRef.current;
        if (!canvas) return { success: false, error: 'Canvas not mounted' };

        canvas.width = photo.naturalWidth;
        canvas.height = photo.naturalHeight;
        const ctx = canvas.getContext('2d');

        // Draw the photo
        ctx.drawImage(photo, 0, 0);

        // Detect pose
        const landmarks = await detectImage(photo);

        if (!landmarks || landmarks.length === 0) {
          return {
            success: false,
            error: 'No pose detected in this photo. Try a photo showing your full upper body.',
          };
        }

        // Use lenient visibility for static photos
        const keypoints = extractKeypoints(landmarks, canvas.width, canvas.height, {
          minVisibility: 0.2,
        });

        if (!keypoints) {
          return {
            success: false,
            error:
              'Could not detect shoulders and hips clearly enough. ' +
              'Try a photo where your full upper body (shoulders to hips) is visible and well-lit.',
          };
        }

        // Draw cloth overlay
        const clothImg = await ensureClothLoaded();
        if (clothImg) {
          drawWarpedCloth(ctx, clothImg, keypoints, template);
        }

        URL.revokeObjectURL(photoUrl);
        return { success: true };
      } catch (err) {
        console.error('Photo processing failed:', err);
        return { success: false, error: 'Failed to process photo. Please try another image.' };
      }
    },
    [detectImage, template, ensureClothLoaded]
  );

  return {
    canvasRef,
    processPhoto,
  };
}
