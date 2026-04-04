import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, Camera, ChevronUp, ChevronDown, 
  Sparkle as SparkleIcon, TrendingUp, Search, 
  Shirt, Plus, Image as ImageIcon,
  ArrowRight, Loader2, Upload,
  PlusCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// AR Components
import ARView from '../../ar/components/ARView';
import AISidebar from '../../ar/components/AISidebar';
import ClothUploader from '../../ar/components/ClothUploader';
import { TEMPLATES } from '../../ar/utils/templates';

const LiveMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [wardrobe, setWardrobe] = useState([]);
  const [savedWardrobe, setSavedWardrobe] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [baseSnapshot, setBaseSnapshot] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [activeGarment, setActiveGarment] = useState(null);
  const [view, setView] = useState('session'); // 'session' | 'saved'

  // Fetch saved wardrobe on mount
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoadingSaved(true);
        const res = await fetch('http://localhost:5000/api/wardrobe');
        if (res.ok) {
          const data = await res.json();
          setSavedWardrobe(data);
        }
      } catch (e) {
        console.error("Failed to fetch saved wardrobe", e);
      } finally {
        setLoadingSaved(false);
      }
    };
    fetchSaved();
  }, []);

  // Check if we came from a product page with a specific item
  useEffect(() => {
    if (location.state?.autoTryOn) {
      handleClothChange(location.state.autoTryOn);
    }
  }, [location.state]);

  // Sync active garment for AI Sidebar
  useEffect(() => {
    const visible = wardrobe.find(w => w.isVisible);
    if (visible) setActiveGarment(visible);
  }, [wardrobe]);

  const handleClothChange = (newCloth) => {
    setWardrobe(prev => {
      const template = TEMPLATES[newCloth.type] || TEMPLATES.tshirt;
      
      // 1. Remove any existing garments that match this one's signature to prevent duplicates
      const clothId = newCloth.id || `${newCloth.type}-${(newCloth.image || '').slice(-20)}`;
      const filtered = prev.filter(item => item.id !== clothId);

      // 2. Hide other garments in the same category (e.g., hide t-shirt if trying on jacket)
      return filtered.map(item => {
        const itemTmpl = TEMPLATES[item.type] || TEMPLATES.tshirt;
        if (template.category === 'torso' || template.category === 'full-body') {
          if (itemTmpl.category === 'torso' || itemTmpl.category === 'full-body') {
            return { ...item, isVisible: false };
          }
        }
        return item;
      }).concat([{ ...newCloth, id: clothId, isVisible: true }]);
    });
  };

  const toggleVisibility = (id) => {
    setWardrobe(prev => prev.map(item => {
      if (item.id === id) return { ...item, isVisible: !item.isVisible };
      return item;
    }));
  };

  return (
    <div className="relative h-screen w-full bg-zinc-900 overflow-hidden font-sans selection:bg-white selection:text-black text-white">
      
      {/* 1. MAIN AR VIEWPORT */}
      <div className="absolute inset-0 z-0 bg-black">
        <ARView 
          wardrobe={wardrobe} 
          useWarp={true}
          onUserContextUpdate={setUserContext}
          onBaseCapture={setBaseSnapshot}
        />
      </div>

      {/* 2. HEADER CONTROLS - REFINED */}
      <div className="absolute top-10 left-10 right-10 z-[60] flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate('/home')}
          className="p-4 bg-black/60 backdrop-blur-3xl rounded-xl text-zinc-100 hover:bg-white hover:text-black transition-all border border-white/5 pointer-events-auto shadow-2xl"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-3xl p-2 rounded-2xl border border-white/5 shadow-2xl pointer-events-auto">
          <button 
            onClick={async () => {
              const visible = wardrobe.filter(w => w.isVisible);
              if (visible.length === 0) return;
              try {
                const res = await fetch('http://localhost:5000/api/wardrobe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    images: visible.map(v => v.base64Image),
                    clothType: visible[0].type,
                    description: `AI Look: ${visible.map(v => v.type).join(' + ')}`
                  })
                });
                if (res.ok) alert('Look saved.');
              } catch(e) {
                alert('Save failed');
              }
            }}
            disabled={wardrobe.filter(w => w.isVisible).length === 0}
            className="flex items-center gap-3 px-8 py-3.5 bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-20 rounded-xl font-black text-[10px] uppercase tracking-[0.22em] transition-all shadow-lg"
          >
            <SparkleIcon size={16} />
            Save Look
          </button>

          <button 
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-3 px-8 py-3.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl font-black text-[10px] uppercase tracking-[0.22em] transition-all shadow-lg border border-white/5"
          >
            <Upload size={16} />
            New Upload
          </button>

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          <button 
            onClick={() => navigate('/ar/photo')}
            className="flex items-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.22em] transition-all border border-white/10"
          >
            <ImageIcon size={16} />
            Switch Mode
          </button>
        </div>
      </div>

      {/* 3. SIDEBARS - REFINED */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-10 top-32 bottom-32 w-80 z-30 flex flex-col gap-4 pointer-events-none"
      >
        <div className="flex-1 bg-zinc-900/90 backdrop-blur-3xl rounded-2xl border border-white/5 overflow-hidden flex flex-col pointer-events-auto shadow-2xl">
          <div className="flex border-b border-white/5 p-2 gap-2">
            <button 
              onClick={() => setView('session')} 
              className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] rounded-lg transition-all ${view === 'session' ? 'bg-white text-zinc-950 shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              Session
            </button>
            <button 
              onClick={() => setView('saved')} 
              className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] rounded-lg transition-all ${view === 'saved' ? 'bg-white text-zinc-950 shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              Vault
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {view === 'session' ? (
              wardrobe.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                   <Shirt size={48} className="text-white mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.22em]">Awaiting Style Protocol</p>
                </div>
              ) : (
                wardrobe.map(item => (
                  <div key={item.id} onClick={() => toggleVisibility(item.id)} className={`p-4 rounded-xl border transition-all cursor-pointer ${item.isVisible ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 opacity-40'}`}>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-950 border border-white/5 shadow-inner">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-white text-[11px] font-black uppercase tracking-tight truncate">{item.type}</div>
                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.22em] mt-1.5">{item.isVisible ? 'Displaying' : 'Background'}</div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              savedWardrobe.map(session => (
                <div key={session._id} onClick={() => {
                  const imgs = session.images || [session.imageUrl];
                  imgs.forEach(img => handleClothChange({ image: img, base64Image: img, type: session.clothType || 'tshirt' }));
                  setView('session');
                }} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex gap-4">
                    <img src={session.imageUrl || session.images?.[0]} className="w-14 h-14 rounded-lg object-cover bg-zinc-950 border border-white/5" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-white text-[11px] font-black uppercase truncate tracking-tight">{session.description || 'Saved Protocol'}</div>
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.22em] mt-1.5">Load and Apply</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 border-t border-white/5 bg-black/20">
            <button onClick={() => setWardrobe([])} className="w-full py-4 rounded-xl bg-zinc-800 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.22em] hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Clear Cache
            </button>
          </div>
        </div>
      </motion.aside>

      <motion.aside 
        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="absolute right-10 top-32 bottom-32 z-30 flex flex-col pointer-events-none"
      >
        <div className="pointer-events-auto h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900">
          <AISidebar 
            garmentType={activeGarment?.type} 
            description={activeGarment?.description} 
            userContext={userContext} 
            clothBase64={activeGarment?.base64Image} 
          />
        </div>
      </motion.aside>

      <AnimatePresence>
        {showUploader && (
          <ClothUploader onClothChange={handleClothChange} onClose={() => setShowUploader(false)} baseSnapshot={baseSnapshot} userContext={userContext} />
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-white/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default LiveMode;
