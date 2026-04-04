import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white">
      {/* NAVIGATION */}
      <nav className="relative bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between px-6 md:px-8 py-4">
          <div className="text-xl font-bold tracking-tight">PRECISION<span className="font-light">MIRROR</span></div>
          
          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-neutral-500 transition-colors">Features</a>
            <a href="#" className="hover:text-neutral-500 transition-colors">Technology</a>
            <a href="#" className="hover:text-neutral-500 transition-colors">About</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:block px-5 py-2 text-sm font-medium border border-black hover:bg-neutral-100 transition-colors"
            >
              Developer Login
            </Link>
            
            {/* MOBILE MENU TOGGLE */}
            <button 
              className="md:hidden p-2 text-neutral-600 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 z-50 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-6 gap-4 font-medium">
              <a href="#" className="py-2 hover:text-neutral-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#" className="py-2 hover:text-neutral-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Technology</a>
              <a href="#" className="py-2 hover:text-neutral-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
              <Link
                to="/login"
                className="mt-2 px-5 py-3 text-center text-sm font-medium border border-black hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Developer Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:min-h-[80vh] border-b border-neutral-200 overflow-hidden">
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-neutral-200">
          <div className="inline-block px-3 py-1 mb-6 text-[10px] sm:text-xs font-bold tracking-widest border border-black w-max">
            BETA V1.0
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Fit Your Body. <br />
            Match Your Tone. <br />
            Style Your Occasion.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 mb-8 sm:mb-10 max-w-md">
            AI-powered precise virtual try-on and size recommendation system. Intelligent visualization engineered specifically for Indian fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-black text-white font-medium hover:bg-neutral-800 transition-colors text-center"
            >
              Launch Live Try-On
            </Link>
            <button className="px-8 py-4 border border-neutral-300 font-medium hover:border-black transition-colors text-center">
              View Documentation
            </button>
          </div>
        </div>
        
        {/* HERO GRAPHIC PLACEHOLDER */}
        <div className="bg-neutral-50 p-8 flex items-center justify-center relative overflow-hidden">
          {/* This is where your AR demo graphic goes. Keeping it wireframe for now. */}
          <div className="w-full max-w-sm aspect-3/4 border border-neutral-300 bg-white shadow-sm flex flex-col items-center justify-center relative">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Camera Active</span>
            </div>
            <div className="text-neutral-400 font-mono text-sm">[ AR Visualizer Graphic ]</div>
            {/* Wireframe tracking nodes */}
            <div className="absolute w-4 h-4 border border-black top-1/3 left-1/4"></div>
            <div className="absolute w-4 h-4 border border-black top-1/3 right-1/4"></div>
            <div className="absolute w-4 h-4 border border-black top-1/2 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </header>

      {/* CORE FEATURES SECTION */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-200 font-sans">
        <div className="p-8 border-b sm:border-b-0 sm:border-r border-neutral-200 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">01</div>
          <h3 className="text-xl font-bold">Live AR Try-On</h3>
          <p className="text-neutral-600 text-sm">Real-time fabric movement and precise body tracking using advanced spatial mapping.</p>
        </div>
        
        <div className="p-8 border-b sm:border-b-0 lg:border-r border-neutral-200 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">02</div>
          <h3 className="text-xl font-bold">Size Recommendation</h3>
          <p className="text-neutral-600 text-sm">Personalized sizing accuracy tailored specifically to diverse Indian body types and fits.</p>
        </div>
        
        <div className="p-8 sm:col-span-2 lg:col-span-1 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">03</div>
          <h3 className="text-xl font-bold">Multi-layer Draping</h3>
          <p className="text-neutral-600 text-sm">Visualize complex, layered outfits seamlessly before you make a purchase decision.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;