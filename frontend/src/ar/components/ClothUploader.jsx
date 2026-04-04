import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { trimCanvas } from '../utils/imageProcessor';

/**
 * Utility to extract the cropped portion of the image.
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Utility to extract the cropped portion of the rotated image.
 */
const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas boundaries
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central point on canvas to allow image rotation around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste image data with correct offsets for pizel crop
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  const trimmedCanvas = trimCanvas(canvas);
  return {
    url: trimmedCanvas.toDataURL('image/png'),
    base64: trimmedCanvas.toDataURL('image/png'),
    width: trimmedCanvas.width,
    height: trimmedCanvas.height
  };
};

/**
 * Freeform Eraser Canvas Component
 */
function Eraser({ imageSrc, onConfirm }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
       const container = containerRef.current;
       const ratio = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
       canvas.width = img.width * ratio;
       canvas.height = img.height * ratio;
       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const startDraw = (e) => {
    setIsDrawing(true);
    draw(e);
  };
  const endDraw = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paint over the areas to mask (e.g., skin/hands)</p>
      <div ref={containerRef} className="w-full relative h-[45vh] bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/10 cursor-crosshair">
         <canvas 
           ref={canvasRef} 
           onMouseDown={startDraw} 
           onMouseMove={draw} 
           onMouseUp={endDraw}
           onMouseLeave={endDraw}
         />
      </div>
      <button 
        onClick={() => onConfirm(canvasRef.current.toDataURL('image/png'))}
        className="w-full bg-white hover:bg-zinc-200 py-4 rounded-xl font-black text-zinc-950 uppercase text-[10px] tracking-[0.22em] shadow-xl transition-all"
      >
        Lock Edits & Sync asset
      </button>
    </div>
  );
}

export default function ClothUploader({ onClothChange, onClose, baseSnapshot, userContext }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [cleansedImg, setCleansedImg] = useState(null); // The result after Eraser + RmoveBg
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [garmentType, setGarmentType] = useState('tshirt');

  // Multi-step uploader state
  const [step, setStep] = useState('upload'); // 'upload' | 'erase' | 'crop' | 'calibrate'
  const [croppedOutput, setCroppedOutput] = useState(null);
  const [pins, setPins] = useState([]);
  
  // Scraper Feature
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  
  // Dynamic Image Crop Aspect Ratio
  const [dynamicAspect, setDynamicAspect] = useState(3/4);
  const [refAspect, setRefAspect] = useState(null);

  useEffect(() => {
    if (baseSnapshot) {
      const img = new Image();
      img.onload = () => setRefAspect(img.width / img.height);
      img.src = baseSnapshot;
    }
  }, [baseSnapshot]);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProcess = async () => {
    if (!croppedAreaPixels || !cleansedImg) return;
    try {
      setProcessing(true);
      const output = await getCroppedImg(cleansedImg, croppedAreaPixels, rotation);
      setCroppedOutput(output);
      setStep('calibrate');
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleEraserConfirm = async (erasedBase64) => {
    try {
      setProcessing(true);
      const res = await fetch('http://localhost:5000/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: erasedBase64 })
      });

      if (!res.ok) throw new Error("Background removal unable.");
      const data = await res.json();
      
      setCleansedImg(data.result);
      setStep('crop');
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-6">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {step === 'upload' ? 'Upload Image' : step === 'erase' ? 'Step 1: Clean Model out' : step === 'crop' ? 'Step 2: Crop & Align' : 'Step 3: Calibrate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">✕</button>
        </div>

        {step === 'upload' && (
              <div className="w-full flex-col gap-4">
                <div className="w-full h-48 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
                  <p className="text-zinc-200 font-black tracking-[0.22em] uppercase text-[10px]">Select asset from storage</p>
                  <p className="text-zinc-500/60 text-[9px] font-black uppercase tracking-[0.1em] mt-2">Compatible formats: PNG/JPG</p>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                     onFileChange(e);
                     setStep('erase');
                  }} />
                </div>
                
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-gray-800"></div>
                  <span className="px-3 text-xs font-bold uppercase text-gray-500 tracking-wider">OR IMPORT FROM STORE</span>
                  <div className="flex-1 h-px bg-gray-800"></div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Paste a Zara, Myntra, or Amazon link..." 
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                  />
                  <button 
                    disabled={scraping || !scrapeUrl}
                    onClick={async () => {
                      try {
                        setScraping(true);
                        const r = await fetch('http://localhost:5000/api/scrape-image', {
                           method: 'POST', headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ productUrl: scrapeUrl })
                        });
                        const data = await r.json();
                        if (data.error) throw new Error(data.error);
                        const resImg = await fetch(data.imageUrl);
                        const blob = await resImg.blob();
                        setImageSrc(URL.createObjectURL(blob));
                        setStep('erase');
                      } catch(err) {
                        alert(err.message || 'Scraping unable');
                      } finally {
                        setScraping(false);
                      }
                    }}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.22em] transition-all shadow-xl"
                  >
                    {scraping ? 'Analyzing' : 'Sync URL'}
                  </button>
                </div>
              </div>
        )}

        {step === 'erase' && imageSrc && (
           <Eraser 
             imageSrc={imageSrc} 
             onConfirm={handleEraserConfirm} 
           />
        )}

        {step === 'crop' && cleansedImg && (
          <>
            <div className="w-full relative h-[45vh] min-h-[300px] rounded-xl overflow-hidden bg-black mb-4 group">
                {/* Reference Ghost Template */}
                {baseSnapshot && (
                  <div className="absolute inset-0 z-0 opacity-80 pointer-events-none flex items-center justify-center bg-gray-900">
                    <img src={baseSnapshot} alt="reference" className="w-full h-full object-contain" />
                    <div className="absolute top-4 left-4 bg-black/60 border border-white/20 px-3 py-1.5 rounded-lg">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Metrics</p>
                       <p className="text-sm font-mono text-emerald-400">
                         {userContext?.dimensions?.shoulderWidth || '--'}W × {userContext?.dimensions?.torsoHeight || '--'}H
                       </p>
                    </div>
                  </div>
                )}
                
                <div className="absolute inset-0 z-10">
                  <Cropper
                    image={cleansedImg}
                    crop={crop}
                    rotation={rotation}
                    zoom={zoom}
                    minZoom={0.2}
                    restrictPosition={false}
                    aspect={dynamicAspect}
                    mediaStyle={{ opacity: 0.5 }} // MORE TRANSLUCENT FOR REF
                    onMediaLoaded={(mediaSize) => {
                      setDynamicAspect(mediaSize.width / mediaSize.height);
                    }}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              </div>

              <div className="w-full mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest w-12">Zoom</span>
                  <input type="range" value={zoom} min={0.2} max={3} step={0.01} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 accent-white" />
                  <span className="text-gray-500 text-[10px] font-mono">{parseFloat(zoom).toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest w-12">Rotate</span>
                  <button onClick={() => setRotation(r => r - 90)} className="p-1 px-2.5 bg-gray-800 rounded border border-gray-700 text-xs text-gray-300 hover:text-white transition">↺ -90</button>
                  <input type="range" value={rotation} min={-180} max={180} step={1} onChange={(e) => setRotation(e.target.value)} className="flex-1 accent-white" />
                  <button onClick={() => setRotation(r => r + 90)} className="p-1 px-2.5 bg-gray-800 rounded border border-gray-700 text-xs text-gray-300 hover:text-white transition">↻ +90</button>
                  <span className="text-gray-500 text-[10px] font-mono min-w-[32px]">{rotation}°</span>
                </div>
              </div>
              
              <div className="w-full flex gap-4 mt-6">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-gray-400 text-sm font-medium">Garment Type</span>
                  <div className="flex flex-wrap gap-2">
                    {['tshirt', 'shirt', 'jacket', 'kurta', 'sherwani', 'saree', 'lehenga_top', 'pants', 'lehenga_bottom', 'turban', 'glasses', 'watch', 'shoes'].map((type) => (
                      <button key={type} onClick={() => setGarmentType(type)} className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${garmentType === type ? 'bg-white border-white text-zinc-950' : 'bg-black border-white/5 text-zinc-500 hover:text-white'}`}>
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-1/3 bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col gap-4 shadow-inner">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Optical Tips</h3>
                  <div className="flex flex-col gap-3">
                     <p className="text-[9px] text-zinc-500 leading-relaxed font-black uppercase tracking-tight">Sync item with reference silhouette.</p>
                     <p className="text-[9px] text-zinc-500 leading-relaxed font-black uppercase tracking-tight">Tight crop minimizes distortion.</p>
                     <p className="text-[9px] text-zinc-500 leading-relaxed font-black uppercase tracking-tight">Use rotation for axial precision.</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full mt-8 gap-4 justify-end">
                <button onClick={() => setStep('erase')} className="px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.22em] text-zinc-500 bg-white/5 border border-white/5 hover:bg-white/10 transition">Retouch</button>
                <button disabled={processing} onClick={handleProcess} className="px-8 py-3 rounded-xl font-black text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] shadow-xl border border-white/5">
                  {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full block"></span> : null}
                  {processing ? 'Processing' : 'Confirm Calibration'}
                </button>
              </div>
          </>
        )}

        {step === 'calibrate' && croppedOutput && (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest leading-relaxed text-center bg-black border border-white/5 p-4 rounded-xl w-full shadow-inner">
              {['turban', 'glasses', 'watch', 'shoes'].includes(garmentType) 
                ? `Ready to Apply? Accessories use automatic tracking. You can skip pins or just tap anywhere 4 times.`
                : <>For perfect tracking, tap exactly 4 points on the clothes in this order:<br/>
                   <b>
                     {['pants', 'lehenga_bottom'].includes(garmentType)
                       ? '1. Left Waist → 2. Right Waist → 3. Left Hem → 4. Right Hem'
                       : '1. Left Shoulder → 2. Right Shoulder → 3. Left Waist → 4. Right Waist'
                     }
                   </b>
                  </>
              }
            </p>

            <div className="w-full relative h-[45vh] min-h-[300px] rounded-xl overflow-hidden bg-black border-4 border-gray-800 flex items-center justify-center">
              {/* GHOST REFERENCE BEHIND PINS (Sync with window size!) */}
              {baseSnapshot && (
                <img 
                  src={baseSnapshot} 
                  alt="ghost" 
                  className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none z-0" 
                />
              )}
              
              {/* SHRINK-WRAPPED CONTAINER TO ENSURE PINS MAP EXACTLY TO IMAGE PIXELS */}
              <div className="relative max-w-full max-h-full inline-flex font-[0px] z-10">
                <img 
                  src={croppedOutput.url} 
                  className="max-w-full max-h-full cursor-crosshair select-none opacity-50 block"
                  draggable="false"
                  onClick={(e) => {
                    if (pins.length >= 4) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPins([...pins, { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }]);
                  }}
                />
                {pins.map((p, i) => (
                  <div key={i} className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white pointer-events-none flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_15px_rgba(239,68,68,1)] z-20" style={{ left: `calc(${p.x * 100}% - 12px)`, top: `calc(${p.y * 100}% - 12px)` }}>
                    {i+1}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full mt-2 justify-between items-center text-xs">
              {pins.length < 4 ? <span className="text-yellow-400 font-mono">PINS: {pins.length} / 4</span> : <span className="text-green-400 font-bold tracking-wide">✓ CALIBRATED</span>}
              <button onClick={() => setPins([])} disabled={pins.length === 0} className="text-red-400 hover:text-red-300 transition uppercase font-bold disabled:opacity-50">Reset Pins</button>
            </div>

            <div className="flex w-full mt-4 gap-4 justify-end border-t border-gray-800 pt-6">
              <button onClick={() => { setPins([]); setStep('crop'); }} className="px-6 py-2.5 rounded-xl font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition">Back</button>
              <button onClick={() => {
                onClothChange({ image: croppedOutput.url, base64Image: croppedOutput.base64, type: garmentType, targetPins: pins, description: `Uploaded ${garmentType}` });
                onClose();
              }} disabled={pins.length < 4 && !['turban', 'glasses', 'watch', 'shoes'].includes(garmentType)} className="px-6 py-2.5 rounded-xl font-medium text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 transition drop-shadow-md">Apply to AR!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
