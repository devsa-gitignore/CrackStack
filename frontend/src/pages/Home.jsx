import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Masonry from '../components/Masonry';
import MagicBento from '../components/MagicBento';
import { bentoCards, categories, products } from '../data/products';

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const masonryItems = useMemo(() => {
    return filteredProducts.map((product) => ({
      id: product.id,
      img: product.img,
      height: product.height,
      title: product.name,
      category: product.category,
      badge: product.badge,
      price: product.price,
      description: product.description,
      onClick: () => navigate(`/product/${product.id}`)
    }));
  }, [filteredProducts, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 pt-24 text-zinc-900">
      <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-10">
        <section className="p-2 sm:p-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Home Feed</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Discover clothes that feel alive on the page</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Search outfits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                  activeCategory === category
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {masonryItems.length > 0 ? (
              <Masonry
                items={masonryItems}
                ease="power3.out"
                duration={0.6}
                stagger={0.04}
                animateFrom="bottom"
                scaleOnHover
                hoverScale={1.02}
                blurToFocus
                colorShiftOnHover={false}
              />
            ) : (
              <div className="rounded-[28px] border border-dashed border-zinc-700 bg-zinc-900 px-6 py-16 text-center text-zinc-400">
                No matches found for your search.
              </div>
            )}

            <div className="mt-5">
              <MagicBento
                cards={bentoCards}
                textAutoHide={false}
                enableStars
                enableSpotlight
                enableBorderGlow={true}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect
                spotlightRadius={340}
                particleCount={10}
                glowColor="161, 161, 170"
                disableAnimations={false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
