/**
 * Cloth type fitting templates.
 * 
 * widthMult    — overall cloth width relative to shoulder width
 * heightMult   — cloth height relative to torso height
 * topWidthMult — top edge width (shoulders) for trapezoid warp
 * botWidthMult — bottom edge width (waist) for trapezoid warp
 * yOffset      — vertical offset from shoulder midpoint (fraction of torso height)
 * 
 * topWidthMult > botWidthMult creates the waist-taper / fabric-draping illusion.
 */

export const TEMPLATES = {
  tshirt: {
    category: 'torso',
    widthMult: 2.45,
    heightMult: 2.05,
    topWidthMult: 2.45,
    botWidthMult: 1.70,
    yOffset: -0.25,
    neckCutout: false,
  },
  shirt: {
    category: 'torso',
    widthMult: 2.50,
    heightMult: 2.10,
    topWidthMult: 2.50,
    botWidthMult: 1.80,
    yOffset: -0.25,
    neckCutout: false,
    isOpen: false,
  },
  jacket: {
    category: 'torso',
    widthMult: 2.70,
    heightMult: 2.25,
    topWidthMult: 2.70,
    botWidthMult: 2.0,
    yOffset: -0.25,
    neckCutout: false,
    isOpen: true,
  },
  kurta: {
    category: 'full-body',
    widthMult: 2.35,
    heightMult: 2.50,
    topWidthMult: 2.35,
    botWidthMult: 1.70,
    yOffset: -0.25,
    neckCutout: false,
  },
  sherwani: {
    category: 'full-body',
    widthMult: 2.45,
    heightMult: 2.75,
    topWidthMult: 2.45,
    botWidthMult: 1.80,
    yOffset: -0.25,
    neckCutout: false,
  },
  saree: {
    category: 'full-body',
    widthMult: 2.65,
    heightMult: 3.00,
    topWidthMult: 2.65,
    botWidthMult: 2.10,
    yOffset: -0.18,
    neckCutout: false,
    isSaree: true,
  },
  lehenga_top: {
    category: 'torso',
    widthMult: 2.65,
    heightMult: 1.10,
    topWidthMult: 2.65,
    botWidthMult: 1.70,
    yOffset: -0.18,
    neckCutout: false,
    isCrop: true,
  },
  pants: {
    category: 'legs',
    widthMult: 2.9,
    heightMult: 1.55,
    topWidthMult: 2.9,
    botWidthMult: 2.6,
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true,
  },
  lehenga_bottom: {
    category: 'legs',
    widthMult: 4.8,
    heightMult: 1.6,
    topWidthMult: 2.6,
    botWidthMult: 6.5,
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true,
    padding: 0.1,
  },
  turban: {
    category: 'over-head',
    widthMult: 1.8,
    heightMult: 1.2,
    yOffset: -0.5,
    isHead: true,
  },
  glasses: {
    category: 'face',
    widthMult: 2.1,       // Width relative to eye distance (ideal for standard fit)
    heightMult: 0.9,      // Height relative to eye distance
    yOffset: 0.05,        // Adjusted to sit perfectly on the nose bridge
    isFace: true,
  },
  watch: {
    category: 'wrists',
    widthMult: 2.5,
    heightMult: 1.5,
    yOffset: 1,
    isWrist: true,
  },
  shoes: {
    category: 'feet',
    widthMult: 1.2,
    heightMult: 0.8,
    yOffset: 0.2,
    isShoes: true,
  },
};

export const DEFAULT_TYPE = 'tshirt';
