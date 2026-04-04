/**
 * Trapezoid Perspective Warp Engine
 * 
 * Warps a flat garment PNG onto a trapezoidal region defined by the body's
 * shoulder width and hip width. Uses triangle subdivision + affine transforms
 * on HTML5 Canvas to approximate perspective mapping.
 * 
 * The key insight: topWidth > botWidth creates waist taper / draping illusion.
 */

const NUM_STRIPS = 12; // Vertical subdivisions (8-16 is good quality/perf balance)

// Global buffers for offscreen composite masking (initialized lazily)
let bufferCanvas = null;
let bufferCtx = null;

/**
 * Solve the affine transform matrix that maps one triangle to another.
 * 
 * Source triangle: (sx0,sy0), (sx1,sy1), (sx2,sy2)
 * Dest triangle:   (dx0,dy0), (dx1,dy1), (dx2,dy2)
 * 
 * Returns [a, b, c, d, e, f] for ctx.transform(a, b, c, d, e, f)
 */
function solveAffine(sx0, sy0, sx1, sy1, sx2, sy2, dx0, dy0, dx1, dy1, dx2, dy2) {
  // We need to find the matrix M such that M * [src] = [dst]
  // Using the standard 3-point affine solution:
  const denom = (sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1));
  
  if (Math.abs(denom) < 1e-10) return null; // Degenerate triangle

  const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const b = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const c = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const d = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const e = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;
  const f = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;

  return [a, b, c, d, e, f];
}

/**
 * Rotate a point around a center by a given angle.
 */
function rotatePoint(px, py, cx, cy, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

/**
 * Draw a single triangle from the source image onto the canvas using affine transform.
 */
function drawTriangle(ctx, img, imgW, imgH,
  sx0, sy0, sx1, sy1, sx2, sy2,   // source triangle (in image pixel coords)
  dx0, dy0, dx1, dy1, dx2, dy2    // destination triangle (in canvas coords)
) {
  const matrix = solveAffine(sx0, sy0, sx1, sy1, sx2, sy2, dx0, dy0, dx1, dy1, dx2, dy2);
  if (!matrix) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();

  ctx.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
  ctx.drawImage(img, 0, 0);

  ctx.restore();
}

/**
 * Render a garment image warped into a trapezoid shape on the canvas.
 * 
 * @param {CanvasRenderingContext2D} ctx — canvas 2D context
 * @param {HTMLImageElement} img — the garment PNG (transparent background)
 * @param {Object} keypoints — extracted body keypoints from landmarks.js
 * @param {Object} template — cloth type template from templates.js
 * @param {Array} clothPins — Optional custom 4-point calibration array
 */
export function drawWarpedCloth(ctx, img, keypoints, template, clothPins) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (!keypoints || !img || imgW === 0 || imgW === undefined) return;

  // ── ACCESSORY ANCHORING (NEW) ──────────────────────────────────────────
  if (template.isHead) {
    const { headTop, leftEye, rightEye, eyeDistance } = keypoints;
    if (!headTop || !leftEye || !rightEye) return;
    
    // Scale calibrated to facial proportions
    const headScale = eyeDistance * 2.5; 
    
    // Use eye-to-eye tilt for natural head rotation
    const headTilt = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    
    const clothWidth = headScale * template.widthMult;
    const clothHeight = headScale * template.heightMult;
    const yOff = headScale * (template.yOffset || 0);

    ctx.save();
    ctx.translate(headTop.x, headTop.y + yOff);
    ctx.rotate(headTilt);
    ctx.drawImage(img, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight);
    ctx.restore();
    return;
  }

  if (template.isFace) {
    const { leftEye, rightEye, eyeDistance } = keypoints;
    if (!leftEye || !rightEye) return;

    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    
    // Calculate precise head tilt from eye positions
    const headTilt = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    
    // Width calibrated relative to eye-to-eye distance (Pupillary Distance)
    const clothWidth = eyeDistance * template.widthMult;
    const clothHeight = eyeDistance * template.heightMult;
    const yOff = eyeDistance * (template.yOffset || 0);

    ctx.save();
    // Anchor precisely between eyes (the bridge region)
    ctx.translate(eyeMidX, eyeMidY);
    ctx.rotate(headTilt);
    ctx.translate(0, yOff);
    ctx.drawImage(img, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight);
    ctx.restore();
    return;
  }

  if (template.isWrist) {
    // Check both wrists, default to left if both are available
    const arm = keypoints.arms?.left || keypoints.arms?.right;
    if (!arm || !arm.wrist || !arm.elbow) return; // CRITICAL FIX: Ensure elbow exists for angle calculation
    
    const wrist = arm.wrist;
    const elbow = arm.elbow;
    const wristScale = keypoints.shoulderWidth * 0.2;
    
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const wristAngle = Math.atan2(dy, dx) + Math.PI / 2;
    
    const clothWidth = wristScale * template.widthMult;
    const clothHeight = wristScale * template.heightMult;
    const yOff = wristScale * (template.yOffset || 0); // Apply vertical offset along the arm axis

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(wristAngle);
    ctx.translate(0, yOff); // Move it slightly up/down the arm
    ctx.drawImage(img, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight);
    ctx.restore();
    return;
  }

  if (template.isShoes) {
    const feet = [
      { ankle: keypoints.leftAnkle, toe: keypoints.leftToe },
      { ankle: keypoints.rightAnkle, toe: keypoints.rightToe }
    ];

    feet.forEach(({ ankle, toe }) => {
      if (!ankle) return;
      const shoeScale = keypoints.torsoHeight * 0.18;
      let shoeAngle = keypoints.angle || 0;
      if (toe) {
        shoeAngle = Math.atan2(toe.y - ankle.y, toe.x - ankle.x);
      }
      
      const clothWidth = shoeScale * template.widthMult;
      const clothHeight = shoeScale * template.heightMult;
      const yOff = shoeScale * (template.yOffset || 0);

      ctx.save();
      ctx.translate(ankle.x, ankle.y);
      ctx.rotate(shoeAngle);
      ctx.translate(0, yOff);
      ctx.drawImage(img, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight);
      ctx.restore();
    });
    return;
  }


  // ── BODY GARMENT LOGIC ──────────────────────────────────────
  const { shoulderWidth, torsoHeight, anchorX, anchorY, angle, hipMid, hipWidth, legHeight, hipAngle, arms, leftShoulder, rightShoulder, leftHip, rightHip } = keypoints;

  let localTemplate = template;
  
  // Decide core anchors depending on upper or lower body
  const isBottom = template.isBottom === true;
  const coreWidth = isBottom ? hipWidth : shoulderWidth;
  const coreHeight = isBottom ? legHeight : torsoHeight;
  const actAnchorX = isBottom ? hipMid.x : anchorX;
  const actAnchorY = isBottom ? hipMid.y : anchorY;
  const actAngle = isBottom ? hipAngle : angle;

  let customYOff = coreHeight * template.yOffset;
  let customClothHeight = coreHeight * template.heightMult;

  if (clothPins && clothPins.length === 4) {
    // ==== MANUAL CALIBRATION MODE ====
    // User picked 4 specific pixels on the source image for shoulders and hips.
    // To make it idiot-proof, sort the 4 pins so the click order doesn't matter:
    // 1. Sort by Y to separate Top from Bottom
    const sortedByY = [...clothPins].sort((a, b) => a.y - b.y);
    const topPins = sortedByY.slice(0, 2).sort((a, b) => a.x - b.x); // Top Left, Top Right
    const botPins = sortedByY.slice(2, 4).sort((a, b) => a.x - b.x); // Bot Left, Bot Right

    const pTL = topPins[0];
    const pTR = topPins[1];
    const pBL = botPins[0];
    const pBR = botPins[1];

    // We mathematically derive the exact scale multipliers and vertical offsets!
    // We use Math.max to prevent division by zero in case of identical clicks
    const pinS_w = Math.max(0.01, pTR.x - pTL.x); // Shoulders width ratio
    const pinS_h = Math.max(0.01, ((pBL.y + pBR.y) / 2) - ((pTL.y + pTR.y) / 2)); // Torso height ratio
    const autoWidthMult = 1.0 / pinS_w;
    const autoHeightMult = 1.0 / pinS_h;
    
    // The top offset is calculated relative to where the top pins are located on the image.
    const pinY_avg = (pTL.y + pTR.y) / 2;
    customYOff = -(pinY_avg / pinS_h) * coreHeight;

    localTemplate = {
      ...template,
      widthMult: autoWidthMult,
      topWidthMult: autoWidthMult,
      botWidthMult: (Math.max(0, pBR.x - pBL.x) / pinS_w) * autoWidthMult,
      heightMult: autoHeightMult
    };
    customClothHeight = coreHeight * localTemplate.heightMult;
  }

  // Final vertical position adjustment (Removing older hardcoded paddings)
  if (!isBottom) {
    // No extra shift needed when pins are used, as pins define the exact anchor.
    // However, if no pins are used, the template yOffset handles the position.
  }

  // Calculate trapezoid dimensions
  const topWidth = coreWidth * localTemplate.topWidthMult;
  const botWidth = coreWidth * localTemplate.botWidthMult;

  // Base unrotated rectangle corners
  const rectCorners = {
    tl: { x: actAnchorX - topWidth / 2, y: actAnchorY + customYOff },
    tr: { x: actAnchorX + topWidth / 2, y: actAnchorY + customYOff },
    bl: { x: actAnchorX - botWidth / 2, y: actAnchorY + customYOff + customClothHeight },
    br: { x: actAnchorX + botWidth / 2, y: actAnchorY + customYOff + customClothHeight },
  };

  // Initialize offscreen buffer for masking
  if (!bufferCanvas) {
    bufferCanvas = document.createElement('canvas');
    bufferCtx = bufferCanvas.getContext('2d');
  }

  // Ensure buffer matches the main canvas
  if (bufferCanvas.width !== ctx.canvas.width || bufferCanvas.height !== ctx.canvas.height) {
    bufferCanvas.width = ctx.canvas.width;
    bufferCanvas.height = ctx.canvas.height;
  }

  // Clear previous frame data from buffer
  bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

  // Advance 2.5D Physical Draping: Subdivide into vertical strips
  // Instead of a rigid trapezoid, we curve the bottom hem and simulate 3D chest cylinder yaw!
  for (let i = 0; i < NUM_STRIPS; i++) {
    const t0 = i / NUM_STRIPS;
    const t1 = (i + 1) / NUM_STRIPS;

    // Physics Drape: Add a natural downward curve to the hem (middle sags down)
    const sag0 = Math.sin(t0 * Math.PI) * (customClothHeight * 0.08);
    const sag1 = Math.sin(t1 * Math.PI) * (customClothHeight * 0.08);

    // Initial Linear Interpolation
    const baseTopL = { x: rectCorners.tl.x + (rectCorners.tr.x - rectCorners.tl.x) * t0, y: rectCorners.tl.y + (rectCorners.tr.y - rectCorners.tl.y) * t0 };
    const baseTopR = { x: rectCorners.tl.x + (rectCorners.tr.x - rectCorners.tl.x) * t1, y: rectCorners.tl.y + (rectCorners.tr.y - rectCorners.tl.y) * t1 };
    const baseBotL = { x: rectCorners.bl.x + (rectCorners.br.x - rectCorners.bl.x) * t0, y: rectCorners.bl.y + (rectCorners.br.y - rectCorners.bl.y) * t0 + sag0 };
    const baseBotR = { x: rectCorners.bl.x + (rectCorners.br.x - rectCorners.bl.x) * t1, y: rectCorners.bl.y + (rectCorners.br.y - rectCorners.bl.y) * t1 + sag1 };

    // Perspective Yaw Shift: Simulate the 3D cylinder of the body turning away from camera
    const yawOffset = (keypoints.yawAngle || 0) * topWidth * 0.35;
    const yawShift0 = Math.sin(t0 * Math.PI) * yawOffset;
    const yawShift1 = Math.sin(t1 * Math.PI) * yawOffset;

    baseTopL.x += yawShift0;
    baseBotL.x += yawShift0;
    baseTopR.x += yawShift1;
    baseBotR.x += yawShift1;

    // Apply strict 2D geometric angle rotation (leaning side to side)
    const dTopLeft  = rotatePoint(baseTopL.x, baseTopL.y, actAnchorX, actAnchorY, actAngle);
    const dTopRight = rotatePoint(baseTopR.x, baseTopR.y, actAnchorX, actAnchorY, actAngle);
    const dBotLeft  = rotatePoint(baseBotL.x, baseBotL.y, actAnchorX, actAnchorY, actAngle);
    const dBotRight = rotatePoint(baseBotR.x, baseBotR.y, actAnchorX, actAnchorY, actAngle);

    // Source coordinates on the flat image
    const sLeft  = t0 * imgW;
    const sRight = t1 * imgW;

    // Upper triangle: topLeft → topRight → botRight
    drawTriangle(
      bufferCtx, img, imgW, imgH,
      sLeft, 0,     sRight, 0,    sRight, imgH,    // source
      dTopLeft.x, dTopLeft.y,  dTopRight.x, dTopRight.y,  dBotRight.x, dBotRight.y  // dest
    );

    // Lower triangle: topLeft → botRight → botLeft
    drawTriangle(
      bufferCtx, img, imgW, imgH,
      sLeft, 0,     sRight, imgH,   sLeft, imgH,   // source
      dTopLeft.x, dTopLeft.y,  dBotRight.x, dBotRight.y,  dBotLeft.x, dBotLeft.y   // dest
    );
  }

  // ==== ADVANCED 3D COLLISION & OCCLUSION ====
  bufferCtx.save();

  // If the user's arms cross in front of their body (e.g., crossing arms, reaching out),
  // we must forcefully erase the rendered fabric pixels precisely where the arm exists.
  // We only do this when the arm is within the Torso Region to preserve sleeves!
  if (arms && !isBottom && leftShoulder && rightShoulder && leftHip && rightHip) {
    // 1. Define the "Torso Bounds" as a clipping path
    // Slightly tighter around the torso to prevent accidental shoulder-side clipping
    bufferCtx.beginPath();
    bufferCtx.moveTo(leftShoulder.x, leftShoulder.y);
    bufferCtx.lineTo(rightShoulder.x, rightShoulder.y);
    bufferCtx.lineTo(rightHip.x + (shoulderWidth * 0.05), rightHip.y);
    bufferCtx.lineTo(leftHip.x - (shoulderWidth * 0.05), leftHip.y);
    bufferCtx.closePath();
    bufferCtx.clip();

    bufferCtx.globalCompositeOperation = 'destination-out';
    bufferCtx.lineCap = 'round';
    bufferCtx.lineJoin = 'round';
    
    // Physical arm thickness is approximately 30-35% of human shoulder width
    bufferCtx.lineWidth = shoulderWidth * 0.28; // Slightly thinner stroke for less aggressive masking

    // Extract raw Z depths for 3D checks
    const ls_z = keypoints.ls_z || 0;
    const rs_z = keypoints.rs_z || 0;
    const body_z = (ls_z + rs_z) / 2;

    const maskArm = (arm, shoulder, arm_z_avg) => {
      // 1. Joint Visibility Check
      if (!arm || !arm.elbow || !arm.wrist) return;
      
      // 2. 3D Depth Check (MediaPipe Z: smaller means closer to camera)
      // REDUCED SENSITIVITY: Requirement is now 0.12 (used to be 0.05)
      // This means arm needs to be noticeably in front of the chest to trigger.
      if (arm_z_avg > body_z - 0.12) return;

      bufferCtx.beginPath();
      // SHOLDER SAFETY: Start the erasure 25% down the arm towards the elbow
      // This prevents the shirt's collar/shoulder area from being severed.
      const armStart = {
        x: shoulder.x + (arm.elbow.x - shoulder.x) * 0.25,
        y: shoulder.y + (arm.elbow.y - shoulder.y) * 0.25
      };
      
      bufferCtx.moveTo(armStart.x, armStart.y);
      bufferCtx.lineTo(arm.elbow.x, arm.elbow.y);
      bufferCtx.lineTo(arm.wrist.x, arm.wrist.y);
      
      // If fingers are tracked, trace to the fingertips
      if (arm.index) {
        bufferCtx.lineTo(arm.index.x, arm.index.y);
      }
      bufferCtx.stroke();
    };

    maskArm(arms.left, leftShoulder, arms.left?.wrist?.z || 0);
    maskArm(arms.right, rightShoulder, arms.right?.wrist?.z || 0);
  }

  // ==== CULTURAL & LAYERED GARMENT MASKING ====
  // 1. OPEN JACKET: Erase a deep V down the center of the chest to show the inner shirt
  if (localTemplate.isOpen) {
    bufferCtx.globalCompositeOperation = 'destination-out';
    bufferCtx.beginPath();
    
    // We draw an inverted triangle over the center chest
    const collarCenterX = anchorX;
    const collarCenterY = anchorY + (torsoHeight * 0.05); // Start slightly below collarbone
    const openingWidth = shoulderWidth * 0.22; // How wide the jacket is open at the bottom
    
    bufferCtx.moveTo(collarCenterX, collarCenterY);
    bufferCtx.lineTo(anchorX - openingWidth, anchorY + torsoHeight);
    bufferCtx.lineTo(anchorX + openingWidth, anchorY + torsoHeight);
    bufferCtx.fill();
    bufferCtx.closePath();
  }

  // 2. SAREE DRAPE (Asymmetric): A pallu strongly favors the left shoulder, 
  // fully exposing the right shoulder, right arm, and mid-right chest.
  if (localTemplate.isSaree) {
    bufferCtx.globalCompositeOperation = 'destination-out';
    bufferCtx.beginPath();
    
    // Erase the entire top-right block (from center to right shoulder down to right hip)
    // We use anchorX (center) sweeping out to the right bounds.
    bufferCtx.moveTo(anchorX, anchorY - (torsoHeight * 0.2)); 
    bufferCtx.lineTo(rightShoulder.x + (shoulderWidth), rightShoulder.y - (torsoHeight * 0.2)); // Way out to the right
    bufferCtx.lineTo(rightShoulder.x + (shoulderWidth), anchorY + (torsoHeight * 0.7)); // Down the right side
    
    // Angle it diagonally towards the left hip to form the traditional drape cut
    bufferCtx.lineTo(anchorX + (shoulderWidth * 0.1), anchorY + (torsoHeight * 0.6));
    bufferCtx.lineTo(anchorX, anchorY);
    
    bufferCtx.fill();
    bufferCtx.closePath();
  }

  // 3. CROP TOPS: Strictly slice everything below the mid-ribcage
  if (localTemplate.isCrop) {
    bufferCtx.globalCompositeOperation = 'destination-out';
    bufferCtx.beginPath();
    // A horizontal slice starting 45% down the torso
    const cropY = anchorY + (torsoHeight * 0.50);
    bufferCtx.rect(anchorX - shoulderWidth, cropY, shoulderWidth * 2, torsoHeight * 2);
    bufferCtx.fill();
    bufferCtx.closePath();
  }

  // Restore everything after all masks are applied
  bufferCtx.restore();

  // Commit the perfectly occluded garment buffer to the main live camera canvas
  ctx.drawImage(bufferCanvas, 0, 0);
}

/**
 * Simple flat overlay (no warp) — used as Phase 4 fallback / debug mode.
 */
export function drawFlatCloth(ctx, img, keypoints, template) {
  const imgW = img.naturalWidth || img.width;
  if (!keypoints || !img || imgW === 0 || imgW === undefined) return;

  const { shoulderWidth, torsoHeight, anchorX, anchorY, angle } = keypoints;
  const clothWidth = shoulderWidth * template.widthMult;
  const clothHeight = torsoHeight * template.heightMult;
  const yOff = torsoHeight * template.yOffset;

  ctx.save();
  ctx.translate(anchorX, anchorY + yOff);
  ctx.rotate(angle);
  ctx.drawImage(img, -clothWidth / 2, 0, clothWidth, clothHeight);
  ctx.restore();
}
