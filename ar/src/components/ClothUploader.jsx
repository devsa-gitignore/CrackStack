import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { trimCanvas } from '../utils/imageProcessor';

/**
 * Utility to extract the cropped portion of the image.
 */
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
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
      <p className="text-sm font-bold text-indigo-300">🖌️ Paint over the parts you want to hide (like faces/hands)</p>
      <div ref={containerRef} className="w-full relative h-[45vh] bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-indigo-500/20 cursor-crosshair">
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
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-2xl font-black text-white"
      >
        LOCK EDITS & REMOVE BACKGROUND
      </button>
    </div>
  );
}

export default function ClothUploader({ onClothChange, onClose, baseSnapshot, userContext }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [cleansedImg, setCleansedImg] = useState(null); // The result after Eraser + RmoveBg
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
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
      const output = await getCroppedImg(cleansedImg, croppedAreaPixels);
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

      if (!res.ok) throw new Error("Background removal failed.");
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
                <div className="w-full h-48 border-2 border-dashed border-indigo-700/50 rounded-xl flex flex-col items-center justify-center bg-indigo-900/10 hover:bg-indigo-900/20 transition cursor-pointer relative">
                  <span className="text-5xl mb-3">👕</span>
                  <p className="text-indigo-200 font-medium tracking-wide">Click to upload a photo</p>
                  <p className="text-indigo-400/60 text-xs mt-1">Upload a shirt, jacket, or kurta</p>
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
                        alert(err.message || 'Scraping failed');
                      } finally {
                        setScraping(false);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-sm transition text-white"
                  >
                    {scraping ? 'Extracting...' : 'Grab It!'}
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
                    zoom={zoom}
                    aspect={dynamicAspect}
                    mediaStyle={{ opacity: 0.5 }} // MORE TRANSLUCENT FOR REF
                    onMediaLoaded={(mediaSize) => {
                      setDynamicAspect(mediaSize.width / mediaSize.height);
                    }}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              </div>

              <div className="w-full mt-4 flex items-center gap-4">
                <span className="text-gray-400 text-sm font-medium">Zoom</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-indigo-500" />
              </div>
              
              <div className="w-full mt-6 flex flex-col gap-2">
                <span className="text-gray-400 text-sm font-medium">Garment Type</span>
                <div className="flex flex-wrap gap-2">
                  {['tshirt', 'shirt', 'jacket', 'kurta', 'sherwani', 'saree', 'lehenga_top', 'pants', 'lehenga_bottom'].map((type) => (
                    <button key={type} onClick={() => setGarmentType(type)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${garmentType === type ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex w-full mt-8 gap-4 justify-end">
                <button onClick={() => setStep('erase')} className="px-6 py-2.5 rounded-xl font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition">Retouch</button>
                <button disabled={processing} onClick={handleProcess} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-2">
                  {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full block"></span> : null}
                  {processing ? 'Processing...' : 'CONFIRM ALIGNMENT →'}
                </button>
              </div>
          </>
        )}

        {step === 'calibrate' && croppedOutput && (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm leading-relaxed text-center bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30 w-full">
              For perfect tracking, tap exactly 4 points on the clothes in this order:<br/>
              <b>
                {['pants', 'lehenga_bottom'].includes(garmentType)
                  ? '1. Left Waist → 2. Right Waist → 3. Left Hem → 4. Right Hem'
                  : '1. Left Shoulder → 2. Right Shoulder → 3. Left Waist → 4. Right Waist'
                }
              </b>
            </p>

            <div className="w-full relative h-[45vh] min-h-[300px] rounded-xl overflow-hidden bg-black border-4 border-gray-800">
              {/* GHOST REFERENCE BEHIND PINS (Sync with window size!) */}
              {baseSnapshot && (
                <img 
                  src={baseSnapshot} 
                  alt="ghost" 
                  className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none z-0" 
                />
              )}
              
              <img 
                src={croppedOutput.url} 
                className="w-full h-full object-contain cursor-crosshair select-none relative z-10 opacity-50"
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

            <div className="flex w-full mt-2 justify-between items-center text-xs">
              {pins.length < 4 ? <span className="text-yellow-400 font-mono">PINS: {pins.length} / 4</span> : <span className="text-green-400 font-bold tracking-wide">✓ CALIBRATED</span>}
              <button onClick={() => setPins([])} disabled={pins.length === 0} className="text-red-400 hover:text-red-300 transition uppercase font-bold disabled:opacity-50">Reset Pins</button>
            </div>

            <div className="flex w-full mt-4 gap-4 justify-end border-t border-gray-800 pt-6">
              <button onClick={() => { setPins([]); setStep('crop'); }} className="px-6 py-2.5 rounded-xl font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition">Back</button>
              <button onClick={() => {
                onClothChange({ image: croppedOutput.url, base64Image: croppedOutput.base64, type: garmentType, targetPins: pins, description: `Uploaded ${garmentType}` });
                onClose();
              }} disabled={pins.length < 4} className="px-6 py-2.5 rounded-xl font-medium text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 transition drop-shadow-md">Apply to AR!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
