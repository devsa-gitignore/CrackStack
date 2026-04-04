import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Masonry from '../components/Masonry';

const allItems = [
  { id: 1, name: 'Classic Black Tee', category: 'T-Shirt', price: '₹1,499', img: '/images/shirt.png', height: 500 },
  { id: 2, name: 'Charcoal Kurta', category: 'Kurta', price: '₹2,899', img: '/images/kurta.png', height: 600 },
  { id: 3, name: 'Rider Jacket', category: 'Jacket', price: '₹5,999', img: '/images/jacket.png', height: 550 },
  { id: 4, name: 'Black Silk Saree', category: 'Saree', price: '₹8,499', img: '/images/saree.png', height: 700 },
  { id: 5, name: 'Royal Sherwani', category: 'Sherwani', price: '₹12,999', img: '/images/sherwani.png', height: 650 },
  { id: 6, name: 'Bridal Lehenga', category: 'Lehenga', price: '₹18,499', img: '/images/lehenga.png', height: 700 },
  { id: 7, name: 'Minimal Watch', category: 'Watch', price: '₹3,499', img: '/images/watch.png', height: 400 },
  { id: 8, name: 'Formal Shirt', category: 'Shirt', price: '₹1,899', img: '/images/shirt.png', height: 500 },
  { id: 9, name: 'Summer Kurta', category: 'Kurta', price: '₹2,199', img: '/images/kurta.png', height: 580 },
  { id: 10, name: 'Denim Jacket', category: 'Jacket', price: '₹4,499', img: '/images/jacket.png', height: 520 },
  { id: 11, name: 'Festive Saree', category: 'Saree', price: '₹6,999', img: '/images/saree.png', height: 680 },
  { id: 12, name: 'Chronograph Watch', category: 'Watch', price: '₹7,999', img: '/images/watch.png', height: 420 },
];

const filterCategories = ['All', 'T-Shirt', 'Shirt', 'Kurta', 'Jacket', 'Saree', 'Sherwani', 'Lehenga', 'Watch'];

function Wardrobe() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState(new Set());

  const filteredItems = allItems.filter(item => {
    const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSave = (id) => {
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-xl font-extrabold tracking-tight">My Wardrobe</h1>
            </div>
            <Link to="/" className="text-2xl font-extrabold tracking-tighter text-zinc-300 hover:text-zinc-900 transition-colors">
              outfyt<span className="text-zinc-400">.</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search your wardrobe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-14 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-10">
          {filterCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                activeFilter === cat
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                  : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-zinc-400 font-medium">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </div>
          {savedItems.size > 0 && (
            <div className="text-sm text-zinc-500 font-medium flex items-center gap-1.5">
              <Heart size={14} className="fill-zinc-900 text-zinc-900" />
              {savedItems.size} saved
            </div>
          )}
        </div>

        {/* Items grid — using product cards instead of masonry for wardrobe (cleaner UX) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-32">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 mb-3">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Save button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(item.id);
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    savedItems.has(item.id)
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart size={14} className={savedItems.has(item.id) ? 'fill-white' : ''} />
                </button>

                {/* Quick-try badge */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <div className="bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2">
                    <ShoppingBag size={12} />
                    Quick Try-On
                  </div>
                </div>
              </div>

              <div className="px-1">
                <div className="text-xs text-zinc-400 font-semibold tracking-wide uppercase">{item.category}</div>
                <h3 className="text-sm font-bold mt-0.5 tracking-tight">{item.name}</h3>
                <div className="text-sm text-zinc-500 font-semibold mt-1">{item.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wardrobe;
