import React, { useState } from 'react';
import { Search, ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const products = [
  {
    id: 1,
    name: 'Classic Tee',
    category: 'T-Shirt',
    price: '₹1,499',
    img: '/images/shirt.png',
  },
  {
    id: 2,
    name: 'Rider Jacket',
    category: 'Jacket',
    price: '₹4,999',
    img: '/images/jacket.png',
  },
  {
    id: 3,
    name: 'Charcoal Kurta',
    category: 'Kurta',
    price: '₹2,999',
    img: '/images/kurta.png',
  },
  {
    id: 4,
    name: 'Royal Sherwani',
    category: 'Sherwani',
    price: '₹12,499',
    img: '/images/sherwani.png',
  },
  {
    id: 5,
    name: 'Midnight Saree',
    category: 'Saree',
    price: '₹8,999',
    img: '/images/saree.png',
  },
  {
    id: 6,
    name: 'Minimal Watch',
    category: 'Watch',
    price: '₹3,499',
    img: '/images/watch.png',
  },
  {
    id: 7,
    name: 'Lehenga Top',
    category: 'Lehenga',
    price: '₹5,499',
    img: '/images/lehenga.png',
  },
  {
    id: 8,
    name: 'Linen Shirt',
    category: 'T-Shirt',
    price: '₹2,199',
    img: '/images/shirt.png',
  },
];

const categories = ['All', 'T-Shirt', 'Jacket', 'Kurta', 'Saree', 'Sherwani', 'Watch'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-24">
      {/* Header / Search */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-black tracking-tighter">Explore<span className="text-zinc-400">.</span></h1>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap border ${
                  activeCategory === cat 
                    ? 'bg-zinc-900 text-white border-zinc-900' 
                    : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => {
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 mb-3">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-zinc-400 hover:text-red-500 transition-colors">
                    <Heart size={18} />
                  </button>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                    <button className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors">
                      <ShoppingBag size={14} /> Try On
                    </button>
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="text-sm font-bold truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-zinc-500">{product.category}</span>
                    <span className="text-sm font-black">{product.price}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-400 font-medium italic">No matches found for your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
