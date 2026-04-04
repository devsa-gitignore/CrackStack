/**
 * Standard International Size Chart for Garments (approximate)
 */
const SIZE_CHART = [
  { label: 'XS', minShoulder: 0, maxShoulder: 39, minTorso: 0, maxTorso: 65 },
  { label: 'S', minShoulder: 39, maxShoulder: 42, minTorso: 65, maxTorso: 70 },
  { label: 'M', minShoulder: 42, maxShoulder: 45, minTorso: 70, maxTorso: 74 },
  { label: 'L', minShoulder: 45, maxShoulder: 48, minTorso: 74, maxTorso: 78 },
  { label: 'XL', minShoulder: 48, maxShoulder: 51, minTorso: 78, maxTorso: 82 },
  { label: 'XXL', minShoulder: 51, maxShoulder: 54, minTorso: 82, maxTorso: 86 },
  { label: '3XL', minShoulder: 54, maxShoulder: 999, minTorso: 86, maxTorso: 999 },
];

/**
 * Calculates real-world measurements using inter-ocular distance as a reference.
 * Average human eye distance (pupil-to-pupil) is ~6.3cm.
 * 
 * @param {Object} metrics - Pixels metrics (shoulderWidth, torsoHeight, eyeDistance)
 * @returns {Object} - Real world measurements in cm
 */
export function calculateRealMeasurements(metrics) {
  if (!metrics || !metrics.eyeDistance || metrics.eyeDistance === 0) return null;
  const { shoulderWidth, torsoHeight, eyeDistance } = metrics;

  // 1 pixel = (6.3 cm / eyeDistance in pixels)
  // Note: This is an approximation and depends on user facing the camera directly.
  const scale = 6.3 / eyeDistance;
  
  const shoulderCm = shoulderWidth * scale;
  const torsoCm = torsoHeight * scale;

  return {
    shoulder: Math.round(shoulderCm * 10) / 10,
    torso: Math.round(torsoCm * 10) / 10,
  };
}

/**
 * Recommends a size based on measurements.
 */
export function recommendSize(measurements) {
  if (!measurements) return 'Calculating...';

  const { shoulder, torso } = measurements;
  
  // Prioritize shoulder width for top-wear sizing
  const recommendation = SIZE_CHART.find(
    (s) => shoulder >= s.minShoulder && shoulder < s.maxShoulder
  );

  return recommendation ? recommendation.label : 'N/A';
}

/**
 * Returns fit analysis text
 */
export function getFitAnalysis(measurements, recommendedSize) {
  if (!measurements) return "Evaluating your frame...";
  
  const { shoulder, torso } = measurements;
  const ratio = (torso / shoulder).toFixed(2);
  
  let analysis = `Detected Frame: ${shoulder}cm Shoulders × ${torso}cm Length. `;
  
  if (ratio > 1.8) {
    analysis += "You have a lean/tall build—consider 'Slim Fit' or 'Longline' cuts.";
  } else if (ratio < 1.4) {
    analysis += "You have a broad build—look for 'Relaxed' or 'Comfort' fit styles.";
  } else {
    analysis += "You have a balanced build—Standard/Regular fits will look great.";
  }
  
  return analysis;
}
