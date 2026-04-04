import React from 'react';

function LandingPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-neutral-200">
        <div className="text-xl font-bold tracking-tight">PRECISION<span className="font-light">MIRROR</span></div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-neutral-500 transition-colors">Features</a>
          <a href="#" className="hover:text-neutral-500 transition-colors">Technology</a>
          <a href="#" className="hover:text-neutral-500 transition-colors">About</a>
        </div>
        <button className="px-5 py-2 text-sm font-medium border border-black hover:bg-neutral-100 transition-colors">
          Developer Login
        </button>
      </nav>

      {/* HERO SECTION */}
      <header className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-b border-neutral-200">
        <div className="flex flex-col justify-center p-8 lg:p-16 border-r border-neutral-200">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest border border-black w-max">
            BETA V1.0
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Fit Your Body. <br />
            Match Your Tone. <br />
            Style Your Occasion.
          </h1>
          <p className="text-lg text-neutral-600 mb-10 max-w-md">
            AI-powered precise virtual try-on and size recommendation system. Intelligent visualization engineered specifically for Indian fashion.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-black text-white font-medium hover:bg-neutral-800 transition-colors">
              Launch Live Try-On
            </button>
            <button className="px-8 py-4 border border-neutral-300 font-medium hover:border-black transition-colors">
              View Documentation
            </button>
          </div>
        </div>
        
        {/* HERO GRAPHIC PLACEHOLDER */}
        <div className="bg-neutral-50 p-8 flex items-center justify-center relative overflow-hidden">
          {/* This is where your AR demo graphic goes. Keeping it wireframe for now. */}
          <div className="w-full max-w-sm aspect-[3/4] border border-neutral-300 bg-white shadow-sm flex flex-col items-center justify-center relative">
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
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-200">
        <div className="p-8 border-r border-neutral-200 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">01</div>
          <h3 className="text-xl font-bold">Live AR Try-On</h3>
          <p className="text-neutral-600 text-sm">Real-time fabric movement and precise body tracking using advanced spatial mapping.</p>
        </div>
        
        <div className="p-8 border-r border-neutral-200 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">02</div>
          <h3 className="text-xl font-bold">Size Recommendation</h3>
          <p className="text-neutral-600 text-sm">Personalized sizing accuracy tailored specifically to diverse Indian body types and fits.</p>
        </div>
        
        <div className="p-8 flex flex-col gap-4 hover:bg-neutral-50 transition-colors">
          <div className="text-4xl font-light text-neutral-300 mb-4">03</div>
          <h3 className="text-xl font-bold">Multi-layer Draping</h3>
          <p className="text-neutral-600 text-sm">Visualize complex, layered outfits seamlessly before you make a purchase decision.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;