/**
 * Keypoint extraction math from MediaPipe PoseLandmarker output.
 * 
 * MediaPipe returns normalized coords (0–1). We convert to pixel space
 * and compute the derived values needed for cloth rendering.
 */

const LANDMARK = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
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

  // Check visibility for all base landmarks
  const minVisibility = options.minVisibility ?? 0.5;

  const leftShoulder = (ls && ls.visibility > minVisibility) ? { x: ls.x * width, y: ls.y * height } : null;
  const rightShoulder = (rs && rs.visibility > minVisibility) ? { x: rs.x * width, y: rs.y * height } : null;
  const leftHip = (lh && lh.visibility > minVisibility) ? { x: lh.x * width, y: lh.y * height } : null;
  const rightHip = (rh && rh.visibility > minVisibility) ? { x: rh.x * width, y: rh.y * height } : null;

  // Derived Torso Metrics
  const shoulderMid = (leftShoulder && rightShoulder) ? midpoint(leftShoulder, rightShoulder) : null;
  const hipMid = (leftHip && rightHip) ? midpoint(leftHip, rightHip) : null;
  const shoulderWidth = (leftShoulder && rightShoulder) ? distance(leftShoulder, rightShoulder) : 100; // default safe scale
  const torsoHeight = (shoulderMid && hipMid) ? distance(shoulderMid, hipMid) : 200; // default safe scale
  const hipWidth = (leftHip && rightHip) ? distance(leftHip, rightHip) : 100;

  // Eye distance (use for scale)
  const leye = landmarks[LANDMARK.LEFT_EYE];
  const reye = landmarks[LANDMARK.RIGHT_EYE];
  const eyeDistance = (leye && reye && leye.visibility > minVisibility && reye.visibility > minVisibility)
    ? distance({x: leye.x * width, y: leye.y * height}, {x: reye.x * width, y: reye.y * height})
    : 0;

  // Leg data
  const lk = landmarks[LANDMARK.LEFT_KNEE];
  const rk = landmarks[LANDMARK.RIGHT_KNEE];
  const la = landmarks[LANDMARK.LEFT_ANKLE];
  const ra = landmarks[LANDMARK.RIGHT_ANKLE];

  const leftKnee = (lk && lk.visibility > minVisibility) ? { x: lk.x * width, y: lk.y * height } : null;
  const rightKnee = (rk && rk.visibility > minVisibility) ? { x: rk.x * width, y: rk.y * height } : null;
  const leftAnkle = (la && la.visibility > minVisibility) ? { x: la.x * width, y: la.y * height } : null;
  const rightAnkle = (ra && ra.visibility > minVisibility) ? { x: ra.x * width, y: ra.y * height } : null;

  const lh_heel = landmarks[LANDMARK.LEFT_HEEL];
  const rh_heel = landmarks[LANDMARK.RIGHT_HEEL];
  const lt = landmarks[LANDMARK.LEFT_FOOT_INDEX];
  const rt = landmarks[LANDMARK.RIGHT_FOOT_INDEX];
  const leftHeel = (lh_heel && lh_heel.visibility > minVisibility) ? { x: lh_heel.x * width, y: lh_heel.y * height } : null;
  const rightHeel = (rh_heel && rh_heel.visibility > minVisibility) ? { x: rh_heel.x * width, y: rh_heel.y * height } : null;
  const leftToe = (lt && lt.visibility > minVisibility) ? { x: lt.x * width, y: lt.y * height } : null;
  const rightToe = (rt && rt.visibility > minVisibility) ? { x: rt.x * width, y: rt.y * height } : null;

  let legHeight = torsoHeight * 2; // safe fallback
  if (leftAnkle && rightAnkle) {
    const ankleMid = midpoint(leftAnkle, rightAnkle);
    legHeight = distance(hipMid || {x:0, y:0}, ankleMid);
  } else if (leftKnee && rightKnee) {
    const kneeMid = midpoint(leftKnee, rightKnee);
    legHeight = distance(hipMid || {x:0, y:0}, kneeMid) * 2;
  }

  // Tilt angles
  const angle = (leftShoulder && rightShoulder) 
    ? Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) 
    : 0;
  
  const hipAngle = (leftHip && rightHip)
    ? Math.atan2(rightHip.y - leftHip.y, rightHip.x - leftHip.x)
    : 0;

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
      return { x: node.x * width, y: node.y * height, z: node.z, v: node.visibility };
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

  // Head and Face nodes
  const noseRef = landmarks[LANDMARK.NOSE];
  const nose = (noseRef && noseRef.visibility > minVisibility) 
    ? { x: noseRef.x * width, y: noseRef.y * height, z: noseRef.z } 
    : null;

  const le = landmarks[LANDMARK.LEFT_EYE];
  const re = landmarks[LANDMARK.RIGHT_EYE];
  const leftEye = (le && le.visibility > minVisibility) ? { x: le.x * width, y: le.y * height } : null;
  const rightEye = (re && re.visibility > minVisibility) ? { x: re.x * width, y: re.y * height } : null;

  const l_ear = landmarks[LANDMARK.LEFT_EAR];
  const r_ear = landmarks[LANDMARK.RIGHT_EAR];
  const leftEar = (l_ear && l_ear.visibility > minVisibility) ? { x: l_ear.x * width, y: l_ear.y * height } : null;
  const rightEar = (r_ear && r_ear.visibility > minVisibility) ? { x: r_ear.x * width, y: r_ear.y * height } : null;

  // Estimate top of head (roughly same distance above eyes as eyes are above nose)
  let headTop = null;
  if (nose && leftEye && rightEye) {
    const eyeMid = midpoint(leftEye, rightEye);
    const headUpX = eyeMid.x - nose.x;
    const headUpY = eyeMid.y - nose.y;
    headTop = { x: eyeMid.x + headUpX * 1.5, y: eyeMid.y + headUpY * 1.5 };
  }

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
    eyeDistance, // USED FOR SCALE CALIBRATION
    angle,
    hipAngle,
    yawAngle, // 3D YAW!
    ls_z: ls.z,
    rs_z: rs.z,
    anchorX: shoulderMid.x,
    anchorY: shoulderMid.y,
    arms, // EXPORTED ARM NODES!
    nose,
    leftEye,
    rightEye,
    leftEar,
    rightEar,
    headTop,
    leftKnee,
    rightKnee,
    leftAnkle,
    rightAnkle,
    leftHeel,
    rightHeel,
    leftToe,
    rightToe,
  };
}

export { LANDMARK, distance, midpoint };
