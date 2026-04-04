import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Heart } from 'lucide-react';
import Masonry from '../components/Masonry';
import MagicBento from '../components/MagicBento';
import { bentoCards, categories, products } from '../data/products';

const priceBands = [
  {
    id: 'All',
    label: 'All prices',
    predicate: () => true
  },
  {
    id: 'budget',
    label: 'Up to Rs 3,000',
    predicate: (value) => value <= 3000
  },
  {
    id: 'mid',
    label: 'Rs 3,001 - Rs 8,000',
    predicate: (value) => value > 3000 && value <= 8000
  },
  {
    id: 'premium',
    label: 'Above Rs 8,000',
    predicate: (value) => value > 8000
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState('All');
  const [activePriceBand, setActivePriceBand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const availableBadges = useMemo(() => ['All', ...new Set(products.map((product) => product.badge))], []);

  const filteredProducts = useMemo(() => {
    const baseFiltered = products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBadge = activeBadge === 'All' || product.badge === activeBadge;
      const band = priceBands.find((entry) => entry.id === activePriceBand) ?? priceBands[0];
      const matchesPriceBand = band.predicate(product.numericPrice);

      return matchesCategory && matchesSearch && matchesBadge && matchesPriceBand;
    });

    if (sortBy === 'price-low-high') {
      return [...baseFiltered].sort((a, b) => a.numericPrice - b.numericPrice);
    }

    if (sortBy === 'price-high-low') {
      return [...baseFiltered].sort((a, b) => b.numericPrice - a.numericPrice);
    }

    return baseFiltered;
  }, [activeCategory, searchQuery, activeBadge, activePriceBand, sortBy]);

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
      <div className="mx-auto w-full max-w-[1800px] px-4 pb-10 sm:px-6 lg:px-8 2xl:px-10">
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
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Style</p>
                  <div className="flex flex-wrap gap-2">
                    {availableBadges.map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setActiveBadge(badge)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                          activeBadge === badge
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Price Range</p>
                  <div className="space-y-2">
                    {priceBands.map((band) => (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => setActivePriceBand(band.id)}
                        className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                          activePriceBand === band.id
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                        }`}
                      >
                        {band.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Sort</p>
                  <div className="space-y-2">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'price-low-high', label: 'Price: Low to High' },
                      { id: 'price-high-low', label: 'Price: High to Low' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSortBy(option.id)}
                        className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                          sortBy === option.id
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBadge('All');
                    setActivePriceBand('All');
                    setSortBy('featured');
                  }}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

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

        <section className="mt-10 overflow-hidden rounded-[34px] bg-zinc-900 text-white">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-200">
                <Sparkles size={14} />
                More To Explore
              </div>
              <h2 className="mt-5 max-w-xl text-4xl font-black tracking-tight">Keep the scroll feeling premium all the way down</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-300 sm:text-base">
                The feed now lands into a styled closing section instead of fading into empty space. It gives the bottom of the page a destination and keeps the visual energy going.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100">
                  Save Today&apos;s Picks
                  <Heart size={16} />
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15">
                  Explore Wardrobe
                  <Sparkles size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">Feed Size</p>
                <p className="mt-3 text-3xl font-black">{products.length} looks</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">A wider range of essentials, occasion wear, and accessories.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">Visual Focus</p>
                <p className="mt-3 text-3xl font-black">Image-first hover</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">Hover strips away the text so the clothing itself becomes the hero.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tight">Built to feel like a fashion browse, not a plain product list</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      The top opens directly into discovery, the center keeps the interactive styling touches, and the ending now closes with intent instead of going blank.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
