/**
 * Keypoint extraction math from MediaPipe PoseLandmarker output.
 * 
 * MediaPipe returns normalized coords (0–1). We convert to pixel space
 * and compute the derived values needed for cloth rendering.
 * 
 * Key landmark indices (same in both old and new MediaPipe API):
 *   11 = LEFT_SHOULDER
 *   12 = RIGHT_SHOULDER
 *   23 = LEFT_HIP
 *   24 = RIGHT_HIP
 *   13 = LEFT_ELBOW  (optional, for future sleeve fitting)
 *   14 = RIGHT_ELBOW (optional, for future sleeve fitting)
 */

const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
};

/**
 * Euclidean distance between two 2D points.
 */
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Midpoint of two 2D points.
 */
function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

/**
 * Extract the 6 key body metrics from raw MediaPipe landmarks.
 * 
 * @param {Array} landmarks — array of 33 normalized landmarks from PoseLandmarker
 * @param {number} width — canvas/video width in pixels
 * @param {number} height — canvas/video height in pixels
 * @param {Object} [options] — optional settings
 * @param {number} [options.minVisibility=0.5] — minimum visibility score (0-1) for each landmark
 * @returns {Object|null} — extracted metrics, or null if landmarks are missing/low visibility
 */
export function extractKeypoints(landmarks, width, height, options = {}) {
  if (!landmarks || landmarks.length < 25) return null;

  const ls = landmarks[LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[LANDMARK.LEFT_HIP];
  const rh = landmarks[LANDMARK.RIGHT_HIP];

  // Check visibility — MediaPipe gives a visibility score 0-1
  const minVisibility = options.minVisibility ?? 0.5;

  const visibilities = {
    leftShoulder: ls.visibility,
    rightShoulder: rs.visibility,
    leftHip: lh.visibility,
    rightHip: rh.visibility,
  };

  const failing = Object.entries(visibilities).filter(([, v]) => v < minVisibility);

  if (failing.length > 0) {
    console.warn(
      `[extractKeypoints] Visibility too low (threshold=${minVisibility}):`,
      Object.fromEntries(Object.entries(visibilities).map(([k, v]) => [k, v.toFixed(3)])),
      '| Failing:', failing.map(([k, v]) => `${k}=${v.toFixed(3)}`).join(', ')
    );
    return null;
  }

  // Convert normalized (0-1) coords to pixel space
  const leftShoulder = { x: ls.x * width, y: ls.y * height };
  const rightShoulder = { x: rs.x * width, y: rs.y * height };
  const leftHip = { x: lh.x * width, y: lh.y * height };
  const rightHip = { x: rh.x * width, y: rh.y * height };

  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid = midpoint(leftHip, rightHip);

  const shoulderWidth = distance(leftShoulder, rightShoulder);
  const torsoHeight = distance(shoulderMid, hipMid);
  const hipWidth = distance(leftHip, rightHip);

  // Leg data (if visible)
  let legHeight = torsoHeight * 2; // safe fallback
  const la = landmarks[LANDMARK.LEFT_ANKLE];
  const ra = landmarks[LANDMARK.RIGHT_ANKLE];
  if (la && ra && la.visibility > minVisibility && ra.visibility > minVisibility) {
    const leftAnkle = { x: la.x * width, y: la.y * height };
    const rightAnkle = { x: ra.x * width, y: ra.y * height };
    const ankleMid = midpoint(leftAnkle, rightAnkle);
    legHeight = distance(hipMid, ankleMid);
  } else {
    // If ankles are missing, fallback to knees if possible
    const lk = landmarks[LANDMARK.LEFT_KNEE];
    const rk = landmarks[LANDMARK.RIGHT_KNEE];
    if (lk && rk && lk.visibility > minVisibility && rk.visibility > minVisibility) {
      const leftKnee = { x: lk.x * width, y: lk.y * height };
      const rightKnee = { x: rk.x * width, y: rk.y * height };
      const kneeMid = midpoint(leftKnee, rightKnee);
      legHeight = distance(hipMid, kneeMid) * 2; // Knees are roughly halfway down the leg
    }
  }

  // Shoulder tilt angle in radians
  const angle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );
  
  // Hip tilt angle in radians (for pants)
  const hipAngle = Math.atan2(
    rightHip.y - leftHip.y,
    rightHip.x - leftHip.x
  );

  // 3D YAW ROTATION (Facing direction calculation)
  // MediaPipe provides localized Z depth! We can calculate actual 3D body rotation.
  const shoulderDx = rs.x - ls.x; 
  const shoulderDz = rs.z - ls.z; // Difference in depth
  // When facing forward (0), dz is ~0. Turning body left/right shifts dz.
  // Pitch (leaning forward/back) could also be calculated via shoulder/hip Z.
  const yawAngle = Math.atan2(shoulderDz, shoulderDx);

  // Arm node extraction for occlusion logic
  const arms = { left: null, right: null };
  const getArmNode = (idx) => {
    const node = landmarks[idx];
    if (node && node.visibility > minVisibility) {
      return { x: node.x * width, y: node.y * height, v: node.visibility };
    }
    return null;
  };

  arms.left = {
    elbow: getArmNode(LANDMARK.LEFT_ELBOW),
    wrist: getArmNode(LANDMARK.LEFT_WRIST),
    index: getArmNode(LANDMARK.LEFT_INDEX),
  };
  arms.right = {
    elbow: getArmNode(LANDMARK.RIGHT_ELBOW),
    wrist: getArmNode(LANDMARK.RIGHT_WRIST),
    index: getArmNode(LANDMARK.RIGHT_INDEX),
  };

  return {
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    shoulderMid,
    hipMid,
    shoulderWidth,
    torsoHeight,
    hipWidth,
    legHeight,
    angle,
    hipAngle,
    yawAngle, // 3D YAW!
    anchorX: shoulderMid.x,
    anchorY: shoulderMid.y,
    arms, // EXPORTED ARM NODES!
  };
}

export { LANDMARK, distance, midpoint };
