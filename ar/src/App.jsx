import { useState } from 'react';
import ARView from './components/ARView';
import PhotoFallback from './components/PhotoFallback';
import AISidebar from './components/AISidebar';
import ClothUploader from './components/ClothUploader';

const MODES = {
  CAMERA: 'camera',
  PHOTO: 'photo',
};

export default function App() {
  const [mode, setMode] = useState(MODES.CAMERA);
  const [useWarp, setUseWarp] = useState(true);
  
  // Custom Cloth State management
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [wardrobe, setWardrobe] = useState([
    {
      id: 1,
      image: '/mock-tshirt.png',
      base64Image: null,
      type: 'tshirt',
      description: null,
      targetPins: null,
      isVisible: true,
    }
  ]);
  
  // Stores user body dimensions, complexion, and reference image
  const [userContext, setUserContext] = useState(null);
  const [baseSnapshot, setBaseSnapshot] = useState(null);

  const handleClothChange = (clothData) => {
    // We prepend the new cloth so it becomes the FIRST visible item found by the Sidebar
    setWardrobe(prev => [{ ...clothData, id: Date.now(), isVisible: true }, ...prev]);
    setIsUploaderOpen(false);
  };

  const toggleGarment = (id) => {
    setWardrobe(prev => prev.map(item => item.id === id ? { ...item, isVisible: !item.isVisible } : item));
  };

  const removeGarment = (id) => {
    setWardrobe(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-screen w-screen flex bg-gray-950 text-white overflow-hidden">
      
      {/* Main Left Side - App Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-5 py-3 bg-gray-900/80 backdrop-blur-md border-b border-white/5 z-20 absolute top-0 w-full left-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-indigo-400">AR</span> Try-On
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <span>⇧</span> Upload Garment
            </button>

            {/* Warp Toggle */}
            <button
              onClick={() => setUseWarp((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                useWarp
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {useWarp ? '◆ Warp ON' : '▬ Flat ON'}
            </button>

            {/* Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
              <button
                onClick={() => setMode(MODES.CAMERA)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === MODES.CAMERA ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                📷 Camera
              </button>
              <button
                onClick={() => setMode(MODES.PHOTO)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === MODES.PHOTO ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🖼️ Photo
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden pt-[60px] bg-black">
          {mode === MODES.CAMERA ? (
            <ARView
              wardrobe={wardrobe}
              useWarp={useWarp}
              onUserContextUpdate={setUserContext}
              onBaseCapture={setBaseSnapshot}
            />
          ) : (
            <PhotoFallback garment={wardrobe.find(g => g.isVisible) || wardrobe[0]} />
          )}
          
          {/* WARDROBE MULTI-LAYER CONTROLS */}
          <div className="absolute left-6 top-24 z-30 flex flex-col gap-2">
            {wardrobe.map((garment) => (
              <div key={garment.id} className={`flex items-center gap-3 p-2 rounded-xl backdrop-blur-md border ${garment.isVisible ? 'bg-gray-900/80 border-indigo-500/50' : 'bg-gray-900/40 border-gray-700/50'} shadow-xl transition-all`}>
                <img src={garment.image} alt="garment" className={`w-12 h-12 rounded-lg object-cover ${!garment.isVisible && 'opacity-30 grayscale'}`} />
                <div className="flex-1 flex flex-col pr-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{garment.type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => toggleGarment(garment.id)}
                      className={`text-xs px-2 py-0.5 rounded ${garment.isVisible ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {garment.isVisible ? 'Eye ON' : 'Eye OFF'}
                    </button>
                    <button onClick={() => removeGarment(garment.id)} className="text-xs text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Right Side - AI Sidebar */}
      <AISidebar 
        garmentType={wardrobe.find(g => g.isVisible)?.type || 'tshirt'} 
        description={wardrobe.find(g => g.isVisible)?.description}
        userContext={userContext}
        clothBase64={wardrobe.find(g => g.isVisible)?.base64Image}
      />

      {/* Floating Overlays */}
      {isUploaderOpen && (
        <ClothUploader
          onClose={() => setIsUploaderOpen(false)}
          onClothChange={handleClothChange}
          baseSnapshot={baseSnapshot}
          userContext={userContext}
        />
      )}
    </div>
  );
}
