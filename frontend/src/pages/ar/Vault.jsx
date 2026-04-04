import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2, ChevronRight, Image as ImageIcon, Sparkle as SparkleIcon, ShoppingBag, Loader2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

const ARVault = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/wardrobe`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Vault fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this look?')) return;
    try {
      await fetch(`${API_BASE}/wardrobe/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredSessions = sessions.filter(s => 
    (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.clothType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white pb-32 pt-28 selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* 1. REFINED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5 px-10 py-6 flex items-center justify-between">
         <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate('/home')}
              className="p-4 bg-white/5 rounded-xl hover:bg-white hover:text-black transition border border-white/5 shadow-2xl"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-4 uppercase">
                Vault <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-3 py-1 rounded border border-white/5 tracking-[0.22em] leading-normal">ENCRYPTED</span>
              </h1>
              <p className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.3em] mt-2">Neural Asset Repository</p>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition" size={14} />
               <input 
                 type="text" 
                 placeholder="Search protocols..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-zinc-900 border border-white/5 focus:border-white/10 rounded-xl pl-12 pr-8 py-3 text-[11px] font-bold uppercase tracking-widest outline-none transition-all w-80 text-white placeholder-zinc-700 shadow-inner"
               />
            </div>
            
            <button 
              onClick={() => navigate('/ar/live')}
              className="px-8 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] transition shadow-xl flex items-center gap-3"
            >
              <Camera size={18} /> Launch Sync
            </button>
         </div>
      </header>

      {/* 2. MAIN GRID */}
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-10">
        
        {/* LEFT: RESULTS */}
        <section className="space-y-4">
          {loading ? (
             <div className="py-40 flex flex-col items-center opacity-20">
                <Loader2 size={32} className="animate-spin text-white mb-6" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Retrieving Assets...</p>
             </div>
          ) : filteredSessions.length === 0 ? (
             <div className="py-40 flex flex-col items-center opacity-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                   <ImageIcon size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-4 text-white">Repository Empty</h3>
                <p className="text-[10px] max-w-xs text-zinc-500 uppercase tracking-widest font-bold leading-relaxed">Initiate a session to populate your digital archive.</p>
                <button onClick={() => navigate('/ar/live')} className="mt-10 py-3 px-8 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.22em] hover:bg-white hover:text-black transition">Initiate Link &rarr;</button>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                   {filteredSessions.map(session => (
                      <motion.div
                        layout
                        key={session._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`group relative bg-zinc-900/50 rounded-2xl border transition-all overflow-hidden cursor-pointer ${expandedId === session._id ? 'border-white/20 bg-zinc-800' : 'border-white/5 hover:border-white/10'}`}
                        onClick={() => setExpandedId(expandedId === session._id ? null : session._id)}
                      >
                         <div className="flex items-center gap-8 p-8">
                           <div className="w-24 h-24 rounded-xl overflow-hidden bg-black border border-white/5 shrink-0 shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
                             <img src={session.imageUrl || session.images?.[0]} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
                           </div>

                           <div className="flex-1">
                              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">{session.clothType}</div>
                              <h3 className="text-xl font-black tracking-tighter text-white mb-3 leading-tight uppercase">{session.description || 'Custom Build'}</h3>
                              <div className="flex items-center gap-6 text-[9px] text-zinc-500 font-black uppercase tracking-[0.22em]">
                                 <span className="flex items-center gap-2 underline underline-offset-4 decoration-zinc-800">{new Date(session.createdAt).toLocaleDateString()}</span>
                                 <span className="bg-white/5 px-2 py-0.5 rounded-md">{session.images?.length || 1} LAYERS</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-3">
                             <button onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }} className="p-4 bg-white/5 rounded-xl text-zinc-600 hover:text-white hover:bg-red-500 transition-all border border-white/5">
                               <Trash2 size={18} />
                             </button>
                             <div className={`p-4 bg-white/5 rounded-xl text-zinc-300 transition-transform duration-500 border border-white/5 ${expandedId === session._id ? 'rotate-90 bg-white text-zinc-950' : ''}`}>
                                <ChevronRight size={18} />
                             </div>
                           </div>
                         </div>

                         {expandedId === session._id && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-8 pb-10 pt-4 border-t border-white/5 overflow-hidden">
                              <div className="flex flex-wrap gap-12 items-start mt-4">
                                 <div className="flex gap-4">
                                    {session.images?.map((img, i) => (
                                      <div key={i} className="w-20 h-28 rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                                        <img src={img} className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity" />
                                      </div>
                                    ))}
                                 </div>
                                 <div className="flex-1 max-w-sm">
                                    <div className="p-8 bg-black/40 border border-white/5 rounded-2xl shadow-inner relative">
                                       <div className="absolute top-4 right-6 text-zinc-700 font-black text-[8px] uppercase tracking-[0.3em] leading-none flex items-center gap-2"><SparkleIcon size={10}/> NEURAL ANALYTICS</div>
                                       <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.22em] mb-4">Fabric logic observation</h4>
                                       <p className="text-xs font-bold leading-relaxed text-zinc-200 uppercase tracking-widest opacity-80">This configuration optimal for high-contrast environments. Pair with monochrome accessories for maximum visual impact.</p>
                                    </div>
                                    <button 
                                      onClick={() => navigate('/ar/photo', { state: { autoTryOn: { image: session.imageUrl || session.images?.[0], type: session.clothType || 'tshirt' } } })}
                                      className="mt-8 w-full py-4 bg-zinc-800 text-white hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition shadow-xl border border-white/5"
                                    >
                                       <RefreshCw size={16} /> Re-Warp Asset
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                         )}
                      </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          )}
        </section>

        {/* RIGHT: METRICS HUB */}
        <aside className="hidden md:flex flex-col gap-8">
           <div className="p-10 bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] pointer-events-none group-hover:bg-white/10 transition-colors" />
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10">Neural Vault Status</h3>
              
              <div className="space-y-12">
                 <div>
                    <div className="flex justify-between items-end mb-4">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Memory occupancy</span>
                       <span className="text-sm font-black text-white">{((sessions.length * 0.45)).toFixed(1)} MB</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(sessions.length / 50) * 100}%` }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-black border border-white/5 rounded-xl shadow-inner">
                       <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 leading-none">Assets</div>
                       <div className="text-3xl font-black text-white leading-none">{sessions.length}</div>
                    </div>
                    <div className="p-6 bg-black border border-white/5 rounded-xl shadow-inner">
                       <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 leading-none">Fits</div>
                       <div className="text-3xl font-black text-white leading-none">{sessions.filter(s => s.clothType === 'tshirt').length}</div>
                    </div>
                 </div>

                 <button onClick={() => navigate('/ar/live')} className="w-full py-5 bg-white text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-zinc-200 transition-all border border-transparent">
                    Request Sync Protocol
                 </button>
              </div>
           </div>
        </aside>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.02] blur-[150px] pointer-events-none -mb-64 z-0" />
    </div>
  );
;
};

export default ARVault;
