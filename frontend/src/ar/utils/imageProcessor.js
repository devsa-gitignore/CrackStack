/**
 * Utility to tightly trim empty pixels around a garment.
 * Essential for AR to map the garment exactly without transparent padding offsetting it.
 */
export const trimCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // ONLY check alpha channel (> 10 out of 255). 
      // Do not skip white pixels, because white t-shirts are valid!
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  if (minX > maxX || minY > maxY) return canvas;
  
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  
  // Enforce a minimum size just in case
  if (width < 10 || height < 10) return canvas;

  const trimmed = document.createElement('canvas');
  trimmed.width = width;
  trimmed.height = height;
  trimmed.getContext('2d').putImageData(ctx.getImageData(minX, minY, width, height), 0, 0);
  return trimmed;
};

export const loadAndTrimImage = async (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for fetching /mock-tshirt.png
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      if (cvs.width === 0) return resolve(img); // Safety fallback

      cvs.getContext('2d').drawImage(img, 0, 0);
      const trimmed = trimCanvas(cvs);
      resolve(trimmed);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};
