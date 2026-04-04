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
    if (!keypoints.headTop) return;
    const headScale = keypoints.eyeDistance * 2.5; 
    const headAngle = keypoints.angle || 0; 
    const clothWidth = headScale * template.widthMult;
    const clothHeight = headScale * template.heightMult;
    const yOff = headScale * (template.yOffset || 0);

    ctx.save();
    ctx.translate(keypoints.headTop.x, keypoints.headTop.y + yOff);
    ctx.rotate(headAngle);
    ctx.drawImage(img, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight);
    ctx.restore();
    return;
  }

  if (template.isFace) {
    if (!keypoints.nose) return;
    const faceScale = keypoints.eyeDistance * 1.5;
    const faceAngle = keypoints.angle || 0;
    const clothWidth = faceScale * template.widthMult;
    const clothHeight = faceScale * template.heightMult;
    const yOff = faceScale * (template.yOffset || 0);

    ctx.save();
    ctx.translate(keypoints.nose.x, keypoints.nose.y + yOff);
    ctx.rotate(faceAngle);
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
    // User picked exact specific pixels on the source image for shoulders and hips.
    // We mathematically derive the exact scale multipliers and vertical offsets!
    const pinS_w = clothPins[1].x - clothPins[0].x; // Shoulders width ratio
    const pinS_h = ((clothPins[2].y + clothPins[3].y) / 2) - ((clothPins[0].y + clothPins[1].y) / 2); // Torso height ratio
    const autoWidthMult = 1.0 / pinS_w;
    const autoHeightMult = 1.0 / pinS_h;
    
    // The top offset is calculated relative to where the top pins are located on the image.
    const pinY_avg = (clothPins[0].y + clothPins[1].y) / 2;
    customYOff = -(pinY_avg / pinS_h) * coreHeight;

    localTemplate = {
      ...template,
      widthMult: autoWidthMult,
      topWidthMult: autoWidthMult,
      botWidthMult: ((clothPins[3].x - clothPins[2].x) / pinS_w) * autoWidthMult,
      heightMult: autoHeightMult
    };
    customClothHeight = coreHeight * localTemplate.heightMult;
  }

  // Force the garment strictly higher (only for tops! bottoms sit rigidly at waist)
  if (!isBottom) {
    customYOff -= (coreHeight * 0.1);
  } else {
    // Bottoms should map exactly to waist with minor overlap
    customYOff -= (coreHeight * 0.02);
  }

  // Calculate trapezoid dimensions
  const topWidth = coreWidth * localTemplate.topWidthMult;
  const botWidth = coreWidth * localTemplate.botWidthMult;

  // 4 corners of the destination trapezoid (before rotation)
  const rawCorners = {
    tl: { x: actAnchorX - topWidth / 2, y: actAnchorY + customYOff },
    tr: { x: actAnchorX + topWidth / 2, y: actAnchorY + customYOff },
    bl: { x: actAnchorX - botWidth / 2, y: actAnchorY + customYOff + customClothHeight },
    br: { x: actAnchorX + botWidth / 2, y: actAnchorY + customYOff + customClothHeight },
  };

  // Rotate all corners around the active anchor point by the active angle
  const corners = {
    tl: rotatePoint(rawCorners.tl.x, rawCorners.tl.y, actAnchorX, actAnchorY, actAngle),
    tr: rotatePoint(rawCorners.tr.x, rawCorners.tr.y, actAnchorX, actAnchorY, actAngle),
    bl: rotatePoint(rawCorners.bl.x, rawCorners.bl.y, actAnchorX, actAnchorY, actAngle),
    br: rotatePoint(rawCorners.br.x, rawCorners.br.y, actAnchorX, actAnchorY, actAngle),
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

  // Subdivide into vertical strips for smoother warp on the buffer instead of main canvas
  for (let i = 0; i < NUM_STRIPS; i++) {
    const t0 = i / NUM_STRIPS;
    const t1 = (i + 1) / NUM_STRIPS;

    // Interpolate left and right edges of this strip on the destination trapezoid
    const dTopLeft  = { x: corners.tl.x + (corners.tr.x - corners.tl.x) * t0, y: corners.tl.y + (corners.tr.y - corners.tl.y) * t0 };
    const dTopRight = { x: corners.tl.x + (corners.tr.x - corners.tl.x) * t1, y: corners.tl.y + (corners.tr.y - corners.tl.y) * t1 };
    const dBotLeft  = { x: corners.bl.x + (corners.br.x - corners.bl.x) * t0, y: corners.bl.y + (corners.br.y - corners.bl.y) * t0 };
    const dBotRight = { x: corners.bl.x + (corners.br.x - corners.bl.x) * t1, y: corners.bl.y + (corners.br.y - corners.bl.y) * t1 };

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
  if (arms && !isBottom) {
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
