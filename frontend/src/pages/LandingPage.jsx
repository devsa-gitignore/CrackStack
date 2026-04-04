import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scan, Ruler, Layers, Sparkles, ChevronDown } from 'lucide-react';
import TiltedCard from '../components/TiltedCard';
import { motion, useInView } from 'motion/react';

const categories = [
  { name: 'T-Shirt', img: '/images/shirt.png' },
  { name: 'Kurta', img: '/images/kurta.png' },
  { name: 'Jacket', img: '/images/jacket.png' },
  { name: 'Saree', img: '/images/saree.png' },
  { name: 'Sherwani', img: '/images/sherwani.png' },
  { name: 'Lehenga', img: '/images/lehenga.png' },
  { name: 'Watch', img: '/images/watch.png' },
  { name: 'Shirt', img: '/images/shirt.png' },
];

function FadeInSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-x-hidden">

      {/* ─────────── NAVIGATION ─────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter">
            outfyt<span className="text-zinc-400">.</span>
          </Link>
          <div className="hidden md:flex gap-10 text-[13px] font-medium tracking-wide uppercase text-zinc-500">
            <a href="#collections" className="hover:text-zinc-900 transition-colors duration-300">Collections</a>
            <a href="#features" className="hover:text-zinc-900 transition-colors duration-300">Features</a>
            <a href="#about" className="hover:text-zinc-900 transition-colors duration-300">About</a>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 text-[13px] font-semibold bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/20"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <header className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-semibold tracking-widest text-zinc-500 mb-8">
                <Sparkles size={12} />
                NOW IN BETA
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Your Style.
                <br />
                <span className="text-zinc-400">Perfected.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-zinc-500 max-w-md leading-relaxed"
            >
              AI-powered virtual try-on and precision sizing — engineered for Indian fashion. See it on you before you buy it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/25"
              >
                Try It On
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#collections"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-200 font-semibold rounded-full hover:border-zinc-900 transition-all duration-300"
              >
                Browse Collections
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex gap-12 pt-6 border-t border-zinc-100 mt-4"
            >
              <div>
                <div className="text-3xl font-bold tracking-tight">12+</div>
                <div className="text-xs text-zinc-400 font-medium tracking-wide uppercase mt-1">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">98%</div>
                <div className="text-xs text-zinc-400 font-medium tracking-wide uppercase mt-1">Size Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">3s</div>
                <div className="text-xs text-zinc-400 font-medium tracking-wide uppercase mt-1">Try-On Speed</div>
              </div>
            </motion.div>
          </div>

          {/* Right: TiltedCard Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <TiltedCard
              imageSrc="/images/hero.png"
              altText="Outfyt Hero"
              captionText="Outfit of the Day"
              containerHeight="550px"
              containerWidth="100%"
              imageHeight="550px"
              imageWidth="420px"
              scaleOnHover={1.05}
              rotateAmplitude={10}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-1">Featured</div>
                  <div className="text-lg font-extrabold text-zinc-900">Classic Black Tee</div>
                </div>
              }
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={24} className="text-zinc-300" />
        </motion.div>
      </header>

      {/* ─────────── COLLECTIONS GRID ─────────── */}
      <section id="collections" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeInSection>
            <div className="flex items-end justify-between mb-16">
              <div>
                <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3">Curated for you</div>
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Collections</h2>
              </div>
              <Link to="/wardrobe" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </FadeInSection>

          {/* Category cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <FadeInSection key={cat.name} delay={i * 0.08}>
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-zinc-100">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg tracking-tight">{cat.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-white/60 text-xs font-medium opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>
                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-500" />
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES / BENTO ─────────── */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeInSection>
            <div className="text-center mb-20">
              <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3">Why Outfyt</div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Built for Precision</h2>
              <p className="text-zinc-500 text-lg mt-4 max-w-lg mx-auto">
                Advanced technology designed specifically for the diversity of Indian fashion.
              </p>
            </div>
          </FadeInSection>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <FadeInSection delay={0.1} className="lg:col-span-2 lg:row-span-2">
              <div className="group relative h-full min-h-[400px] rounded-3xl bg-zinc-950 text-white p-10 flex flex-col justify-end overflow-hidden">
                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-zinc-800/50 to-transparent rounded-bl-[100px]" />
                <div className="absolute top-10 right-10 w-24 h-24 border border-zinc-700 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-700">
                  <Scan size={40} className="text-zinc-400" />
                </div>
                <div className="relative z-10">
                  <div className="text-6xl font-black text-zinc-700 mb-4">01</div>
                  <h3 className="text-2xl font-extrabold tracking-tight mb-3">Live AR Try-On</h3>
                  <p className="text-zinc-400 max-w-sm leading-relaxed">
                    Real-time fabric movement and precise body tracking using advanced spatial mapping. See every drape, fold, and fit in real-time.
                  </p>
                </div>
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border border-zinc-800 group-hover:border-zinc-600 transition-colors duration-700" />
              </div>
            </FadeInSection>

            {/* Small card 1 */}
            <FadeInSection delay={0.2}>
              <div className="group relative h-full min-h-[200px] rounded-3xl bg-zinc-50 p-8 flex flex-col justify-end overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-colors duration-500">
                <div className="absolute top-8 right-8 w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:-rotate-6 transition-transform duration-500">
                  <Ruler size={24} className="text-white" />
                </div>
                <div className="text-4xl font-black text-zinc-200 mb-3">02</div>
                <h3 className="text-lg font-extrabold tracking-tight mb-2">Size Recommendation</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Personalized sizing tailored to diverse Indian body types and regional fits.
                </p>
              </div>
            </FadeInSection>

            {/* Small card 2 */}
            <FadeInSection delay={0.3}>
              <div className="group relative h-full min-h-[200px] rounded-3xl bg-zinc-50 p-8 flex flex-col justify-end overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-colors duration-500">
                <div className="absolute top-8 right-8 w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                  <Layers size={24} className="text-white" />
                </div>
                <div className="text-4xl font-black text-zinc-200 mb-3">03</div>
                <h3 className="text-lg font-extrabold tracking-tight mb-2">Multi-layer Draping</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Visualize complex layered outfits — dupatta, shawl, or jacket — before you buy.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─────────── CTA SECTION ─────────── */}
      <section className="py-32 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <FadeInSection>
            <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Ready to try before
              <br />
              <span className="text-zinc-500">you buy?</span>
            </h2>
            <p className="text-zinc-400 text-lg mt-6 max-w-md mx-auto">
              Join the beta and experience precision fashion technology built for India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-zinc-900 font-bold rounded-full hover:bg-zinc-100 transition-all duration-300"
              >
                Get Started
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer id="about" className="bg-zinc-950 border-t border-zinc-800 text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-extrabold tracking-tighter text-white mb-4">
                outfyt<span className="text-zinc-600">.</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                AI-powered virtual try-on and size recommendation platform, designed specifically for the diversity of Indian fashion.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#collections" className="hover:text-white transition-colors">Collections</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Try-On</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-16 pt-8 text-xs text-zinc-600">
            © 2026 Outfyt. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;