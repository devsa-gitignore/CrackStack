import { Sparkles, Star, Heart, ArrowRight } from 'lucide-react';

const featuredClothes = [
  {
    name: 'Classic Shirt',
    category: 'Everyday',
    image: '/images/shirt.png',
    accent: 'bg-amber-100 text-amber-700'
  },
  {
    name: 'Layered Jacket',
    category: 'Outerwear',
    image: '/images/jacket.png',
    accent: 'bg-sky-100 text-sky-700'
  },
  {
    name: 'Modern Kurta',
    category: 'Festive',
    image: '/images/kurta.png',
    accent: 'bg-emerald-100 text-emerald-700'
  },
  {
    name: 'Royal Sherwani',
    category: 'Wedding',
    image: '/images/sherwani.png',
    accent: 'bg-rose-100 text-rose-700'
  },
  {
    name: 'Elegant Saree',
    category: 'Traditional',
    image: '/images/saree.png',
    accent: 'bg-fuchsia-100 text-fuchsia-700'
  },
  {
    name: 'Bridal Lehenga',
    category: 'Statement',
    image: '/images/lehenga.png',
    accent: 'bg-orange-100 text-orange-700'
  }
];

function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-28 pt-24 text-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-10 sm:px-6">
        <section className="overflow-hidden rounded-[32px] bg-zinc-900 text-white shadow-xl shadow-zinc-900/10">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-200">
                <Sparkles size={14} />
                New Home Feed
              </div>
              <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                Discover clothes you can explore right after signing in.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-300 sm:text-base">
                Browse different styles, save favorites, and jump into your wardrobe from the bottom navigation.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="rounded-full bg-white/10 px-4 py-2">Trending styles</div>
                <div className="rounded-full bg-white/10 px-4 py-2">Festive collection</div>
                <div className="rounded-full bg-white/10 px-4 py-2">Daily wear</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {featuredClothes.slice(0, 4).map((item) => (
                <div key={item.name} className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-3 overflow-hidden rounded-2xl bg-white/90">
                    <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-zinc-300">{item.category}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center gap-2 text-zinc-500">
              <Star size={18} />
              <span className="text-sm font-semibold">Popular today</span>
            </div>
            <p className="text-2xl font-black tracking-tight">24 new looks</p>
            <p className="mt-2 text-sm text-zinc-500">Fresh picks across casual, festive, and occasion wear.</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center gap-2 text-zinc-500">
              <Heart size={18} />
              <span className="text-sm font-semibold">Wishlist ready</span>
            </div>
            <p className="text-2xl font-black tracking-tight">Save your favorites</p>
            <p className="mt-2 text-sm text-zinc-500">Keep the pieces you like most and revisit them anytime.</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center gap-2 text-zinc-500">
              <ArrowRight size={18} />
              <span className="text-sm font-semibold">Easy navigation</span>
            </div>
            <p className="text-2xl font-black tracking-tight">Home, User, Wardrobe</p>
            <p className="mt-2 text-sm text-zinc-500">The new bottom navbar keeps the main sections one tap away.</p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Browse clothes</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">All different styles</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredClothes.map((item) => (
              <article
                key={item.name}
                className="group overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-zinc-200 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-zinc-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}>
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">Styled for modern wardrobes and everyday discovery.</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-zinc-100 p-2 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
                      aria-label={`Save ${item.name}`}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
