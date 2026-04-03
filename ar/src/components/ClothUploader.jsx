import { useState, useCallback } from 'react';
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

  return new Promise((resolve) => {
    trimmedCanvas.toBlob((blob) => {
      resolve({
        url: URL.createObjectURL(blob),
        base64: trimmedCanvas.toDataURL('image/png')
      });
    }, 'image/png');
  });
};

export default function ClothUploader({ onClothChange, onClose }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [garmentType, setGarmentType] = useState('tshirt');

  // Multi-step uploader state
  const [step, setStep] = useState('crop'); // 'crop' | 'calibrate'
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
    if (!croppedAreaPixels || !imageSrc) return;
    
    try {
      setProcessing(true);
      
      // Get the cropped image blob URL and Base64 string
      const croppedOutput = await getCroppedImg(imageSrc, croppedAreaPixels);

      // In a real flow with Python: 
      // 1. We would send this Blob to the Python microservice POST /process
      // 2. Python removes background and classifies (e.g., returns "jacket")
      // 3. We use the transparent PNG and the classified type.
      
      // Hit the shiny new Node.js /remove-bg API!
      const res = await fetch('http://localhost:5000/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: croppedOutput.base64 })
      });

      if (!res.ok) {
        throw new Error("Background removal failed. Did you add REMOVE_BG_API_KEY to your .env?");
      }

      const data = await res.json();
      
      setCroppedOutput({
        url: data.result,
        base64: data.result
      });
      setStep('calibrate');
      
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-6">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {step === 'crop' ? 'Upload & Crop Garment' : 'Calibrate AR Joints'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">✕</button>
        </div>

        {step === 'crop' && (
          <>
            {!imageSrc ? (
              <div className="w-full flex-col gap-4">
                <div className="w-full h-48 border-2 border-dashed border-indigo-700/50 rounded-xl flex flex-col items-center justify-center bg-indigo-900/10 hover:bg-indigo-900/20 transition cursor-pointer relative">
                  <span className="text-5xl mb-3">👕</span>
                  <p className="text-indigo-200 font-medium tracking-wide">Click to upload a photo</p>
                  <p className="text-indigo-400/60 text-xs mt-1">Upload a shirt, jacket, or kurta</p>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} />
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
                        
                        // Fake a fetch locally to cross-origin blob
                        const resImg = await fetch(data.imageUrl);
                        const blob = await resImg.blob();
                        setImageSrc(URL.createObjectURL(blob));
                        
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
            ) : (
              <div className="w-full relative h-[40vh] min-h-[250px] rounded-xl overflow-hidden bg-black mb-4">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={dynamicAspect}
                  onMediaLoaded={(mediaSize) => {
                    // Magically locks the crop box to the exact shape of the original image!
                    setDynamicAspect(mediaSize.width / mediaSize.height);
                  }}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
            )}

            {imageSrc && (
              <div className="w-full mt-4 flex items-center gap-4">
                <span className="text-gray-400 text-sm font-medium">Zoom</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-indigo-500" />
              </div>
            )}

            {imageSrc && (
              <div className="w-full mt-6 flex flex-col gap-2">
                <span className="text-gray-400 text-sm font-medium">Garment Type (Determines AR Fit)</span>
                <div className="flex flex-wrap gap-2">
                  {['tshirt', 'shirt', 'jacket', 'kurta', 'sherwani', 'saree', 'lehenga_top', 'pants', 'lehenga_bottom'].map((type) => (
                    <button key={type} onClick={() => setGarmentType(type)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${garmentType === type ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {garmentType === 'jacket' && <p className="text-xs text-indigo-400 mt-1">★ Jacket: Center chest erased for layered look.</p>}
                {garmentType === 'saree' && <p className="text-xs text-purple-400 mt-1">★ Saree: Asymmetric drape applied. Opposite shoulder erased.</p>}
                {garmentType === 'lehenga_top' && <p className="text-xs text-pink-400 mt-1">★ Lehenga: Midriff automatically exposed.</p>}
              </div>
            )}

            <div className="flex w-full mt-8 gap-4 justify-end">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition">Cancel</button>
              <button disabled={!imageSrc || processing} onClick={handleProcess} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-2">
                {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full block"></span> : null}
                {processing ? 'Processing...' : 'Next: Calibrate'}
              </button>
            </div>
          </>
        )}

        {step === 'calibrate' && croppedOutput && (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm leading-relaxed text-center bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30">
              For perfect tracking, tap exactly 4 points on the clothes in this order:<br/>
              <b>
                {['pants', 'lehenga_bottom'].includes(garmentType)
                  ? '1. Left Waist → 2. Right Waist → 3. Left Hem → 4. Right Hem'
                  : '1. Left Shoulder → 2. Right Shoulder → 3. Left Waist → 4. Right Waist'
                }
              </b>
            </p>

            <div className="relative border-4 border-gray-800 rounded-xl overflow-hidden bg-black/50" style={{ maxWidth: '100%', display: 'inline-block' }}>
              <img 
                src={croppedOutput.url} 
                className="max-h-80 object-contain cursor-crosshair select-none"
                draggable="false"
                onClick={(e) => {
                  if (pins.length >= 4) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPins([...pins, { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }]);
                }}
              />
              {pins.map((p, i) => (
                <div key={i} className="absolute w-5 h-5 bg-red-500 rounded-full border-2 border-white pointer-events-none flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ left: `calc(${p.x * 100}% - 10px)`, top: `calc(${p.y * 100}% - 10px)` }}>
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
