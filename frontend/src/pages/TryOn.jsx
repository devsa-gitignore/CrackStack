import React, { useState, useRef, useCallback } from 'react';
import { 
  X, Camera, ChevronUp, ChevronDown, 
  Sparkles, TrendingUp, Search, 
  Shirt, Plus, Image as ImageIcon,
  ArrowRight, Loader2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const TryOn = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [showRefImageModal, setShowRefImageModal] = useState(true);
  const [refImage, setRefImage] = useState(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [activeAITab, setActiveAITab] = useState('match'); // 'match', 'style', 'trends'
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];

  // Mock clothes data — Try-On Only (No Vendors/Prices for local assets)
  const mockClothes = [
    { id: 1, name: 'Minimalist Shirt', category: 'Tops', img: '/images/shirt.png' },
    { id: 2, name: 'Vintage Jacket', category: 'Outerwear', img: '/images/jacket.png' },
    { id: 3, name: 'Traditional Kurta', category: 'Tops', img: '/images/kurta.png' },
    { id: 4, name: 'Silk Saree', category: 'Dresses', img: '/images/saree.png' },
    { id: 5, name: 'Royal Kurta', category: 'Tops', img: '/images/kurta.png' },
    { id: 6, name: 'Traditional Sherwani', category: 'Outerwear', img: '/images/sherwani.png' },
    { id: 7, name: 'Designer Lehenga', category: 'Dresses', img: '/images/lehenga.png' },
  ];

  const handleCapture = useCallback(() => {
    const imageSrc = '/images/hero.png';
    setRefImage(imageSrc);
    setShowRefImageModal(false);
  }, [webcamRef]);

  const onFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage(reader.result);
        setShowRefImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* 1. BACKGROUND CAMERA VIEW */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
          <img src="/images/hero.png" alt="Try-on preview" className="h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-[32px] border border-white/10 bg-black/30 px-8 py-6 text-center backdrop-blur-md">
              <Camera size={30} className="mx-auto text-white/70" />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-white/80">Camera Preview</p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-white/45">
                Live webcam is unavailable in this build, so a local preview panel is shown here instead.
              </p>
            </div>
          </div>
        </div>
        {/* Subtle camera overlay/vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* 2. HEADER CONTROLS */}
      <div className="absolute top-6 left-6 right-6 z-40 flex justify-between items-center">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <X size={20} />
        </button>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">AR Active</span>
        </div>
        <div className="flex items-center gap-3">
          <label 
            htmlFor="header-file-upload"
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
            title="Try Local File"
          >
            <Upload size={20} />
            <input 
              type="file" 
              id="header-file-upload" 
              className="hidden" 
              onChange={onFileUpload}
              accept="image/*"
            />
          </label>
        </div>
      </div>

      {/* 3. LEFT SIDEBAR: CLOTHES SELECTOR */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-6 top-32 bottom-32 w-72 z-30 flex flex-col gap-4 pointer-events-none"
      >
        <div className="flex-1 bg-zinc-950/95 backdrop-blur-3xl rounded-3xl border border-white/20 overflow-hidden flex flex-col pointer-events-auto">
          {/* Categories */}
          <div className="p-4 border-b border-white/10 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Scrollable Clothes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">Selected for you</h3>
            {mockClothes.filter(item => selectedCategory === 'All' || item.category === selectedCategory).map(item => (
              <div key={item.id} className="group relative bg-white/5 rounded-2xl p-2 border border-transparent hover:border-white/20 transition-all cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-800">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 py-1">
                    <div className="text-white text-[11px] font-bold leading-tight line-clamp-1">{item.name}</div>
                    <div className="text-white/40 text-[9px] font-medium mt-1 uppercase tracking-widest">Try-On Only</div>
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full text-black opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* 4. RIGHT SIDEBAR: AI BAR */}
      <motion.aside 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute right-6 top-32 bottom-32 w-72 z-30 flex flex-col pointer-events-none"
      >
        <div className="flex-1 bg-zinc-950/95 backdrop-blur-3xl rounded-3xl border border-white/20 overflow-hidden flex flex-col pointer-events-auto">
          {/* AI Tabs */}
          <div className="grid grid-cols-3 border-b border-white/10">
            <button 
              onClick={() => setActiveAITab('match')}
              className={`p-4 flex flex-col items-center gap-1 transition-all ${activeAITab === 'match' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
              title="Shop Match"
            >
              <Search size={18} className="text-white" />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">Match</span>
            </button>
            <button 
              onClick={() => setActiveAITab('style')}
              className={`p-4 flex flex-col items-center gap-1 transition-all ${activeAITab === 'style' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
              title="Style Suggestions"
            >
              <Sparkles size={18} className="text-white" />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">Style</span>
            </button>
            <button 
              onClick={() => setActiveAITab('trends')}
              className={`p-4 flex flex-col items-center gap-1 transition-all ${activeAITab === 'trends' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
              title="Trends"
            >
              <TrendingUp size={18} className="text-white" />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">Trends</span>
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            {activeAITab === 'match' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <Search size={32} className="text-white/20 mb-4 mx-auto" />
                <h4 className="text-white text-xs font-bold mb-2">Shop Match</h4>
                <p className="text-white/40 text-[10px] leading-relaxed">Finding items in our marketplace that match your current outfit.</p>
              </div>
            )}
            {activeAITab === 'style' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <Sparkles size={32} className="text-white/20 mb-4 mx-auto" />
                <h4 className="text-white text-xs font-bold mb-2">Style Suggestions</h4>
                <p className="text-white/40 text-[10px] leading-relaxed">Let AI suggest layers and accessories based on your body tone.</p>
              </div>
            )}
            {activeAITab === 'trends' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <TrendingUp size={32} className="text-white/20 mb-4 mx-auto" />
                <h4 className="text-white text-xs font-bold mb-2">Real-time Trends</h4>
                <p className="text-white/40 text-[10px] leading-relaxed">Explore what's trending globally in streetwear and couture.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10">
            <button className="w-full bg-white py-3 rounded-xl text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors">
              Analyze Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* 5. BOTTOM DRAWER: WARDROBE PULL-UP */}
      <motion.div 
        animate={{ y: wardrobeOpen ? 0 : '85%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-x-0 bottom-0 z-50 h-[60vh] bg-zinc-900 border-t border-white/10 flex flex-col"
      >
        <button 
          onClick={() => setWardrobeOpen(!wardrobeOpen)}
          className="w-full py-4 flex flex-col items-center gap-1 group"
        >
          {wardrobeOpen ? <ChevronDown size={20} className="text-white/40 group-hover:text-white transition-colors" /> : <ChevronUp size={20} className="text-white/40 group-hover:text-white transition-colors" />}
          <div className="text-[10px] font-bold text-white uppercase tracking-[0.3em] ml-1">My Wardrobe</div>
        </button>

        <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto no-scrollbar">
          {/* Wardrobe Items */}
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="group flex flex-col gap-3">
              <div className="aspect-[3/4] bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shirt size={40} className="text-white/5" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <button className="w-full bg-white text-black py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider">Try On</button>
                </div>
              </div>
              <div className="px-1">
                <div className="text-white text-[11px] font-bold">Saved Item {i}</div>
                <div className="text-white/40 text-[9px] font-medium mt-1 uppercase tracking-widest">Added Apr 4</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. REFERENCE IMAGE MODAL (Initial Step) */}
      <AnimatePresence>
        {showRefImageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-zinc-900/40 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-xl">
                <UserIcon size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">Set Your Reference</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                For a precise AR fit, we need a front-facing photo of you. Your privacy is protected; images are processed locally.
              </p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleCapture}
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                  <Camera size={18} />
                  Use Live Camera
                </button>
                <div className="relative w-full">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={onFileUpload}
                    accept="image/*"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="w-full bg-zinc-100 text-zinc-900 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all cursor-pointer border border-zinc-200"
                  >
                    <Upload size={18} />
                    Upload Photo
                  </label>
                </div>
              </div>

              <button 
                onClick={() => setShowRefImageModal(false)}
                className="mt-8 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Internal icon for the modal
function UserIcon({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default TryOn;
