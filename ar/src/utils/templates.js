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
    widthMult: 2.1,      // Bounding box includes sleeves across both arms!
    heightMult: 1.50,
    topWidthMult: 2.1,   
    botWidthMult: 1.30,  // Tapers slightly at waist
    yOffset: -0.18,      // Shift UP significantly so the collar sits tightly on the neck
    neckCutout: false,   // Masking removed
  },
  shirt: {
    widthMult: 2.1,
    heightMult: 1.55,
    topWidthMult: 2.1,
    botWidthMult: 1.35,
    yOffset: -0.18,
    neckCutout: false,
    isOpen: false,
  },
  jacket: {
    widthMult: 2.3,
    heightMult: 1.65,
    topWidthMult: 2.3,
    botWidthMult: 1.45,
    yOffset: -0.18,
    neckCutout: false,
    isOpen: true, 
  },
  kurta: {
    widthMult: 2.0,
    heightMult: 1.90,
    topWidthMult: 2.0,
    botWidthMult: 1.30,
    yOffset: -0.18,
    neckCutout: false,
  },
  sherwani: {
    widthMult: 2.1,
    heightMult: 2.10,
    topWidthMult: 2.1,
    botWidthMult: 1.40,
    yOffset: -0.18,
    neckCutout: false,
  },
  saree: {
    widthMult: 2.0,
    heightMult: 2.30,
    topWidthMult: 2.0,
    botWidthMult: 1.40,
    yOffset: -0.15,
    neckCutout: false,
    isSaree: true, 
  },
  lehenga_top: {
    widthMult: 2.0,
    heightMult: 0.80,
    topWidthMult: 2.0,
    botWidthMult: 1.15,
    yOffset: -0.15,
    neckCutout: false,
    isCrop: true, 
  },
  pants: {
    widthMult: 2.2, // Hips are wide
    heightMult: 1.1, // legHeight is already exactly Hip-to-Ankle, so 1.0 is exact. 1.1 adds length.
    topWidthMult: 2.2,
    botWidthMult: 2.0, // Pant legs
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true, // TRIGGERS NEW LEG MATH!
  },
  lehenga_bottom: {
    widthMult: 3.5, // Lehengas flare out heavily
    heightMult: 1.15,
    topWidthMult: 2.0, // Tightly fitted waist
    botWidthMult: 4.5, // Massive flare at the bottom
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true,
  },
};

export const DEFAULT_TYPE = 'tshirt';
