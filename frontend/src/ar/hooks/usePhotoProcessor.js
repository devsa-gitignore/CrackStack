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
  const lastPhotoRef = useRef(null);
  const lastKeypointsRef = useRef(null);

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
      img.onerror = () => reject(new Error('Unable to load cloth image'));
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

        // Save for re-renders
        lastPhotoRef.current = photo;
        lastKeypointsRef.current = keypoints;

        // Initial draw
        const clothImg = await ensureClothLoaded();
        render(photo, keypoints, clothImg);

        URL.revokeObjectURL(photoUrl);
        return { success: true };
      } catch (err) {
        console.error('Photo processing unable:', err);
        return { success: false, error: 'Unable to process photo. Please try another image.' };
      }
    },
    [detectImage, ensureClothLoaded]
  );

  /**
   * Internal render function to draw photo + skeleton + cloth
   */
  const render = useCallback((photo, keypoints, clothImg) => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !keypoints) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(photo, 0, 0);

    // DRAW DYNAMIC SKELETON (Face, Arms, Legs, Body)
    drawFullSkeleton(ctx, keypoints);

    // Draw cloth overlay
    if (clothImg) {
      drawWarpedCloth(ctx, clothImg, keypoints, template);
    }
  }, [template]);

  /**
   * Trigger a re-render when garment changes
   */
  const redraw = useCallback(async () => {
    if (!lastPhotoRef.current || !lastKeypointsRef.current) return;
    const clothImg = await ensureClothLoaded();
    render(lastPhotoRef.current, lastKeypointsRef.current, clothImg);
  }, [ensureClothLoaded, render]);

  return {
    canvasRef,
    processPhoto,
    redraw,
  };
}

/**
 * Full dynamic skeleton drawing logic (matches Live AR View)
 */
function drawFullSkeleton(ctx, k) {
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.6)'; // Indigo-600
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const drawLine = (p1, p2) => {
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  };

  const drawPoint = (p, color = '#6366f1') => {
    if (p) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Body Lines
  drawLine(k.leftShoulder, k.rightShoulder);
  drawLine(k.leftShoulder, k.leftHip);
  drawLine(k.rightShoulder, k.rightHip);
  drawLine(k.leftHip, k.rightHip);

  // Arm Lines
  if (k.arms) {
    if (k.arms.left) {
      drawLine(k.leftShoulder, k.arms.left.elbow);
      drawLine(k.arms.left.elbow, k.arms.left.wrist);
      drawPoint(k.arms.left.elbow);
      drawPoint(k.arms.left.wrist);
    }
    if (k.arms.right) {
      drawLine(k.rightShoulder, k.arms.right.elbow);
      drawLine(k.arms.right.elbow, k.arms.right.wrist);
      drawPoint(k.arms.right.elbow);
      drawPoint(k.arms.right.wrist);
    }
  }

  // Leg Lines
  drawLine(k.leftHip, k.leftKnee);
  drawLine(k.leftKnee, k.leftAnkle);
  drawLine(k.rightHip, k.rightKnee);
  drawLine(k.rightKnee, k.rightAnkle);
  drawLine(k.leftAnkle, k.leftToe);
  drawLine(k.rightAnkle, k.rightToe);

  // Face Points
  drawPoint(k.nose, '#f43f5e'); // Rose 500
  drawPoint(k.leftEye);
  drawPoint(k.rightEye);
  drawPoint(k.leftEar);
  drawPoint(k.rightEar);

  // Connect Shoulder-Nose for context
  if (k.nose) {
    ctx.setLineDash([5, 5]);
    drawLine(k.shoulderMid, k.nose);
    ctx.setLineDash([]);
  }

  // Highlight points
  drawPoint(k.leftShoulder);
  drawPoint(k.rightShoulder);
  drawPoint(k.leftHip);
  drawPoint(k.rightHip);
  drawPoint(k.headTop, '#fbbf24'); // Amber 400
}
