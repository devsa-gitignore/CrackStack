import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, Heart } from 'lucide-react';
import Masonry from '../components/Masonry';
import MagicBento from '../components/MagicBento';

const products = [
  { id: '1', name: 'Classic Black Tee', category: 'T-Shirt', badge: 'Daily Wear', price: 'Rs 1,499', img: '/images/shirt.png', height: 520, description: 'Soft monochrome staple for relaxed city fits.' },
  { id: '2', name: 'Rider Jacket', category: 'Jacket', badge: 'Outerwear', price: 'Rs 4,999', img: '/images/jacket.png', height: 680, description: 'A sharper layer for cooler evenings and bold styling.' },
  { id: '3', name: 'Charcoal Kurta', category: 'Kurta', badge: 'Festive', price: 'Rs 2,999', img: '/images/kurta.png', height: 560, description: 'Clean tailoring designed for elegant everyday celebrations.' },
  { id: '4', name: 'Royal Sherwani', category: 'Sherwani', badge: 'Wedding', price: 'Rs 12,499', img: '/images/sherwani.png', height: 760, description: 'A grand silhouette made for standout ceremonial moments.' },
  { id: '5', name: 'Midnight Saree', category: 'Saree', badge: 'Occasion', price: 'Rs 8,999', img: '/images/saree.png', height: 720, description: 'Fluid drape and evening shine in one refined piece.' },
  { id: '6', name: 'Minimal Watch', category: 'Watch', badge: 'Accessory', price: 'Rs 3,499', img: '/images/watch.png', height: 430, description: 'A polished accent to complete both festive and casual looks.' },
  { id: '7', name: 'Bridal Lehenga', category: 'Lehenga', badge: 'Statement', price: 'Rs 15,499', img: '/images/lehenga.png', height: 780, description: 'Rich volume and detail for the biggest celebration edits.' },
  { id: '8', name: 'Structured Shirt', category: 'Shirt', badge: 'Modern', price: 'Rs 2,199', img: '/images/shirt.png', height: 500, description: 'A crisp silhouette for versatile weekday and weekend styling.' },
  { id: '9', name: 'Ivory Festive Kurta', category: 'Kurta', badge: 'Celebration', price: 'Rs 3,299', img: '/images/kurta.png', height: 610, description: 'Lighter tones and refined details for polished festive dressing.' },
  { id: '10', name: 'Velvet Sherwani', category: 'Sherwani', badge: 'Premium', price: 'Rs 16,999', img: '/images/sherwani.png', height: 820, description: 'Heavy texture and regal structure for grand wedding styling.' },
  { id: '11', name: 'Rose Gold Saree', category: 'Saree', badge: 'Evening', price: 'Rs 9,499', img: '/images/saree.png', height: 700, description: 'Soft shimmer and fluid drape built for night celebrations.' },
  { id: '12', name: 'Cropped Moto Jacket', category: 'Jacket', badge: 'Street', price: 'Rs 5,499', img: '/images/jacket.png', height: 640, description: 'Sharper proportions for a younger, more expressive silhouette.' },
  { id: '13', name: 'Pearl Lehenga Set', category: 'Lehenga', badge: 'Bridal', price: 'Rs 18,499', img: '/images/lehenga.png', height: 840, description: 'Voluminous bridal styling with rich movement and detail.' },
  { id: '14', name: 'Steel Watch', category: 'Watch', badge: 'Minimal', price: 'Rs 4,199', img: '/images/watch.png', height: 390, description: 'Compact and clean, made to finish a dressed-up fit.' },
  { id: '15', name: 'Indigo Layer Shirt', category: 'Shirt', badge: 'Smart Casual', price: 'Rs 2,799', img: '/images/shirt.png', height: 560, description: 'An elevated shirt for sharper everyday styling.' },
  { id: '16', name: 'Ceremony Saree', category: 'Saree', badge: 'Signature', price: 'Rs 10,999', img: '/images/saree.png', height: 760, description: 'Elegant drape and richer tone for standout entrances.' },
  { id: '17', name: 'Textured Jacket', category: 'Jacket', badge: 'New Drop', price: 'Rs 6,299', img: '/images/jacket.png', height: 690, description: 'A bold outer layer with modern structure and edge.' },
  { id: '18', name: 'Heritage Sherwani', category: 'Sherwani', badge: 'Ceremony', price: 'Rs 17,499', img: '/images/sherwani.png', height: 860, description: 'Long-line tailoring with presence and celebration-ready detail.' }
];

const categories = ['All', 'T-Shirt', 'Shirt', 'Jacket', 'Kurta', 'Sherwani', 'Saree', 'Lehenga', 'Watch'];

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

const bentoCards = [
  {
    label: 'Fit',
    title: 'See size-friendly picks faster',
    description: 'Browse silhouettes that make sense for quick try-on instead of guessing from a flat catalog.',
    background: 'linear-gradient(145deg, #111827 0%, #1f2937 100%)'
  },
  {
    label: 'Try On',
    title: 'Move from browse to camera in one step',
    description: 'The feed is designed to lead naturally into AR instead of feeling separate from it.',
    background: 'linear-gradient(180deg, #172554 0%, #1d4ed8 100%)'
  },
  {
    label: 'Wardrobe',
    title: 'Keep the looks worth coming back to',
    description: 'Save standout outfits now and revisit them later from your wardrobe flow.',
    background: 'linear-gradient(180deg, #1c1917 0%, #292524 100%)'
  },
  {
    label: 'Occasion',
    title: 'Spot festive pieces at a glance',
    description: 'Sherwani, saree, and lehenga cards stay visually stronger so occasion wear stands out immediately.',
    background: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)'
  },
  {
    label: 'Daily',
    title: 'Balance statement looks with essentials',
    description: 'Jackets, shirts, kurtas, and tees keep the feed wearable instead of overwhelming.',
    background: 'linear-gradient(180deg, #0f172a 0%, #334155 100%)'
  },
  {
    label: 'Save',
    title: 'Build your shortlist while you browse',
    description: 'Use the feed as a quick discovery layer before committing outfits to your wardrobe.',
    background: 'linear-gradient(180deg, #292524 0%, #44403c 100%)'
  }
];
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Masonry from '../components/Masonry';
import MagicBento from '../components/MagicBento';
import { bentoCards, categories, products } from '../data/products';

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState('All');
  const [activePriceBand, setActivePriceBand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const availableBadges = useMemo(() => ['All', ...new Set(products.map((product) => product.badge))], []);

  const parsePrice = (priceText) => Number(priceText.replace(/[^0-9]/g, ''));

  const filteredProducts = useMemo(() => {
    const baseFiltered = products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBadge = activeBadge === 'All' || product.badge === activeBadge;
      const band = priceBands.find((entry) => entry.id === activePriceBand) ?? priceBands[0];
      const matchesPriceBand = band.predicate(parsePrice(product.price));

      return matchesCategory && matchesSearch && matchesBadge && matchesPriceBand;
    });

    if (sortBy === 'price-low-high') {
      return [...baseFiltered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }

    if (sortBy === 'price-high-low') {
      return [...baseFiltered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
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
                    <button
                      type="button"
                      onClick={() => setSortBy('featured')}
                      className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        sortBy === 'featured'
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      Featured
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('price-low-high')}
                      className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        sortBy === 'price-low-high'
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('price-high-low')}
                      className={`block w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        sortBy === 'price-high-low'
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      Price: High to Low
                    </button>
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
