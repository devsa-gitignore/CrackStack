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
    widthMult: 2.8,       // Increased significantly
    heightMult: 2.05,     // Longer
    topWidthMult: 2.8,   
    botWidthMult: 1.85,  
    yOffset: -0.25,      // Higher up
    neckCutout: false,
  },
  shirt: {
    widthMult: 2.85,
    heightMult: 2.10,
    topWidthMult: 2.85,
    botWidthMult: 1.95,
    yOffset: -0.25,
    neckCutout: false,
    isOpen: false,
  },
  jacket: {
    widthMult: 3.10,
    heightMult: 2.25,
    topWidthMult: 3.10,
    botWidthMult: 2.1,
    yOffset: -0.25,
    neckCutout: false,
    isOpen: true, 
  },
  kurta: {
    widthMult: 2.75,
    heightMult: 2.50,
    topWidthMult: 2.75,
    botWidthMult: 1.85,
    yOffset: -0.25,
    neckCutout: false,
  },
  sherwani: {
    widthMult: 2.85,
    heightMult: 2.75,
    topWidthMult: 2.85,
    botWidthMult: 1.95,
    yOffset: -0.25,
    neckCutout: false,
  },
  saree: {
    widthMult: 2.65,
    heightMult: 3.00,
    topWidthMult: 2.65,
    botWidthMult: 2.10,
    yOffset: -0.18,
    neckCutout: false,
    isSaree: true, 
  },
  lehenga_top: {
    widthMult: 2.65,
    heightMult: 1.10,
    topWidthMult: 2.65,
    botWidthMult: 1.70,
    yOffset: -0.18,
    neckCutout: false,
    isCrop: true, 
  },
  pants: {
    widthMult: 2.9, 
    heightMult: 1.55, 
    topWidthMult: 2.9,
    botWidthMult: 2.6,
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true, 
  },
  lehenga_bottom: {
    widthMult: 4.8,
    heightMult: 1.6,
    topWidthMult: 2.6,
    botWidthMult: 6.5, 
    yOffset: -0.05,
    neckCutout: false,
    isBottom: true,
  },
};

export const DEFAULT_TYPE = 'tshirt';
