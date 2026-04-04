import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Image as ImageIcon, Shirt, 
  Sparkles, Ruler, Scan, ArrowRight, X
} from 'lucide-react';
import { motion } from 'framer-motion';

const ARHub = () => {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'live',
      title: 'Live Camera',
      desc: 'Real-time 3D warping using your webcam.',
      icon: <Camera size={32} />,
      color: 'bg-white',
      textColor: 'text-zinc-900',
      shadow: 'shadow-white/10',
      path: '/ar/live'
    },
    {
      id: 'photo',
      title: 'Photo Upload',
      desc: 'High-fidelity static try-on from a photo.',
      icon: <ImageIcon size={32} />,
      color: 'bg-zinc-900',
      textColor: 'text-white',
      shadow: 'shadow-black/20',
      path: '/ar/photo'
    },
    {
      id: 'vault',
      title: 'Digital Vault',
      desc: 'Manage your saved looks and AI pairings.',
      icon: <Shirt size={32} />,
      color: 'bg-zinc-100',
      textColor: 'text-zinc-900',
      shadow: 'shadow-white/5',
      path: '/ar/vault'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white flex flex-col items-center justify-center p-8 selection:bg-white selection:text-zinc-950 overflow-hidden relative">
      <div className="text-center mb-20 relative z-10">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md text-zinc-400 text-[9px] font-black uppercase tracking-[0.22em] mb-8 shadow-xl">
            <Sparkles size={12} /> NEURAL AR ENGINE
         </div>
         <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase">
            Future <span className="text-zinc-500">Retail.</span>
         </h1>
         <p className="text-zinc-500 text-sm max-w-md mx-auto font-bold uppercase tracking-widest leading-relaxed">
            Propel your style into the digital dimension. Select a protocol to initiate.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl relative z-10">
         {modes.map((mode, i) => (
           <motion.div
             key={mode.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             onClick={() => navigate(mode.path)}
             className={`group relative p-12 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden shadow-2xl flex flex-col justify-end min-h-[440px]`}
           >
              <div className={`absolute top-12 left-12 p-6 rounded-xl ${mode.color} ${mode.textColor} group-hover:scale-105 transition-transform duration-500 shadow-2xl`}>
                 {mode.icon}
              </div>
              
              <div className="relative z-10">
                 <h3 className="text-3xl font-black mb-4 text-white group-hover:text-zinc-400 transition-colors uppercase tracking-tighter">{mode.title}</h3>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 h-10 opacity-70 group-hover:opacity-100 transition-opacity">{mode.desc}</p>
                 <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:gap-6 transition-all">
                    Initiate <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           </motion.div>
         ))}
      </div>

      <div className="mt-24 flex gap-16 text-zinc-700">
         <div className="flex items-center gap-3">
            <Scan size={20} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] leading-none">Spatial Sync</span>
         </div>
         <div className="flex items-center gap-3">
            <Ruler size={20} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] leading-none">Bio Metrics</span>
         </div>
         <div className="flex items-center gap-3">
            <Sparkles size={20} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] leading-none">Style Arch</span>
         </div>
      </div>

      <button 
        onClick={() => navigate('/home')}
        className="absolute top-12 right-12 p-5 bg-zinc-900 border border-white/5 rounded-xl hover:bg-white hover:text-black transition-all z-20 group shadow-2xl"
      >
        <X size={24} className="transition" />
      </button>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default ARHub;
