import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X, Camera, Smartphone, Sparkles,
  Upload, ImageIcon, ArrowRight, RefreshCw,
  Search, Shirt, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// AR Components
import PhotoFallback from '../../ar/components/PhotoFallback';
import AISidebar from '../../ar/components/AISidebar';

const PhotoMode = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initial garment from location state or default
  const [activeGarment, setActiveGarment] = useState(location.state?.autoTryOn || {
    type: 'tshirt',
    image: '/mock-tshirt.png'
  });

  return (
    <div className="relative h-screen w-full bg-zinc-900 overflow-hidden font-sans selection:bg-white selection:text-black flex border-t border-white/5">

      {/* 1. MAIN UI CONTROLS (Floating) */}
      <div className="absolute top-10 left-10 right-10 z-40 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate('/home')}
          className="p-4 bg-black/60 backdrop-blur-3xl rounded-xl text-zinc-100 hover:bg-white hover:text-black transition-all border border-white/5 pointer-events-auto shadow-2xl"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex bg-black/60 backdrop-blur-3xl rounded-xl p-1.5 border border-white/5 shadow-2xl">
            <button
              onClick={() => navigate('/ar/live')}
              className="flex items-center gap-3 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 hover:text-white transition-all"
            >
              <Camera size={16} /> Live Mode
            </button>
            <button
              className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg text-[10px] font-black uppercase tracking-[0.22em] text-zinc-950 transition-all shadow-xl"
            >
              <ImageIcon size={16} /> Photo Mode
            </button>
          </div>
        </div>
      </div>

      {/* 2. PHOTO TRY-ON ENGINE (Center) */}
      <div className="flex-1 relative flex items-center justify-center p-10 bg-zinc-900">
        <div className="w-full h-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(255,255,255,0.02)] relative">
          <PhotoFallback garment={activeGarment} />

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="bg-black/80 backdrop-blur-3xl border border-white/5 px-6 py-3 rounded-lg flex items-center gap-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.22em]">Neural Engine v4.0</span>
              </div>
              <div className="w-px h-5 bg-white/10"></div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-[0.22em] hover:text-zinc-400 transition-colors"
              >
                <RefreshCw size={14} /> Reset Frame
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: AI BAR (Integrated) */}
      <motion.aside
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[400px] h-full flex flex-col pointer-events-auto border-l border-white/5 bg-zinc-900 shadow-2xl"
      >
        <div className="h-full">
          <AISidebar
            garmentType={activeGarment?.type}
            description={activeGarment?.description}
            clothBase64={activeGarment?.base64Image || activeGarment?.image}
          />
        </div>
      </motion.aside>

      {/* Subtle UI Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-white/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[400px] w-[20%] h-[20%] bg-zinc-500/10 blur-[80px] rounded-full" />
      </div>
    </div>
  );
};


export default PhotoMode;
