import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock saved AR sessions — each has a photo and the clothes used
const mockSessions = [
  {
    id: 1,
    photo: '/images/hero.png',
    date: 'Apr 3, 2026',
    clothes: [
      { name: 'Classic Black Tee', category: 'T-Shirt', img: '/images/shirt.png' },
      { name: 'Rider Jacket', category: 'Jacket', img: '/images/jacket.png' },
    ],
  },
  {
    id: 2,
    photo: '/images/hero.png',
    date: 'Apr 2, 2026',
    clothes: [
      { name: 'Charcoal Kurta', category: 'Kurta', img: '/images/kurta.png' },
    ],
  },
  {
    id: 3,
    photo: '/images/hero.png',
    date: 'Apr 1, 2026',
    clothes: [
      { name: 'Royal Sherwani', category: 'Sherwani', img: '/images/sherwani.png' },
      { name: 'Minimal Watch', category: 'Watch', img: '/images/watch.png' },
    ],
  },
];

function Wardrobe() {
  const [sessions, setSessions] = useState(mockSessions);
  const [expandedId, setExpandedId] = useState(null);

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-28 pt-24">

      {/* Header */}
      <header className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/home" className="flex items-center text-zinc-400 hover:text-zinc-900 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-extrabold tracking-tight">My Wardrobe</h1>
            </div>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-6">

        {/* Empty state */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
              <Camera size={32} className="text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">No AR sessions yet</h2>
            <p className="text-zinc-500 text-sm max-w-xs">
              Try on clothes using the AR camera and your saved looks will appear here.
            </p>
          </motion.div>
        )}

        {/* Sessions list */}
        <div className="space-y-4">
          <AnimatePresence>
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100"
              >
                {/* Session header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                >
                  {/* AR Photo thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                    <img
                      src={session.photo}
                      alt="AR session"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">AR Try-On Session</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{session.date}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {session.clothes.length} item{session.clothes.length !== 1 ? 's' : ''} tried
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight
                      size={18}
                      className={`text-zinc-400 transition-transform duration-300 ${
                        expandedId === session.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded: Clothes list */}
                <AnimatePresence>
                  {expandedId === session.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-200 px-4 py-3">
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                          Clothes Used
                        </div>
                        <div className="space-y-3">
                          {session.clothes.map((item, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-200 shrink-0">
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">{item.name}</div>
                                <div className="text-xs text-zinc-400">{item.category}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full AR photo */}
                      <div className="px-4 pb-4">
                        <div className="rounded-xl overflow-hidden aspect-[3/4] bg-zinc-200 mt-3">
                          <img
                            src={session.photo}
                            alt="AR session preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Wardrobe;
