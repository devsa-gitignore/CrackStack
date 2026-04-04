import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, ShoppingBag, Store, 
  ArrowRight, Globe 
} from 'lucide-react';

export default function App() {
  const [isVendor, setIsVendor] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // High-quality Unsplash images for the left panel
  const shopperImg = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200";
  const vendorImg = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200";

  return (
    <div style={{ height: '100vh', display: 'flex', width: '100%', overflow: 'hidden' }} className="bg-white font-sans text-zinc-900">
      
      {/* LEFT PANEL - DYNAMIC VISUAL CANVAS */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-zinc-900">
        {/* Shopper Image */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isVendor ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          style={{ backgroundImage: `url(${shopperImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        {/* Vendor Image */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isVendor ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          style={{ backgroundImage: `url(${vendorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Dynamic Text */}
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <div className="overflow-hidden mb-4">
            <h2 className={`text-4xl md:text-5xl font-bold tracking-tight transition-transform duration-700 ${isVendor ? '-translate-y-full absolute opacity-0' : 'translate-y-0 opacity-100'}`}>
              Discover the <br />latest drops.
            </h2>
            <h2 className={`text-4xl md:text-5xl font-bold tracking-tight transition-transform duration-700 ${isVendor ? 'translate-y-0 opacity-100' : 'translate-y-full absolute opacity-0'}`}>
              Scale your brand. <br />Reach millions.
            </h2>
          </div>
          <p className="text-zinc-300 text-lg max-w-md">
            {isVendor 
              ? "Join the premier destination for independent designers and streetwear labels." 
              : "Shop exclusive collections from the world's best emerging and established brands."}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - AUTHENTICATION ENGINE */}
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="lg:w-1/2 bg-white">
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} className="sm:p-12 md:p-24">
          
          {/* Logo */}
          <div className="mb-12 text-center w-full max-w-sm">
            <h1 className="text-4xl font-extrabold tracking-tighter">outfyt<span className="text-zinc-400">.</span></h1>
          </div>

          {/* Master Switch (Shopper vs Vendor) */}
          <div className="flex bg-zinc-100 rounded-full relative w-full max-w-sm" style={{ padding: '4px', marginBottom: '2.5rem', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)' }}>
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out z-0
                ${isVendor ? 'left-[calc(50%+2px)]' : 'left-1'}`} 
            />
            <button 
              onClick={() => setIsVendor(false)}
              className={`flex-1 py-2.5 z-10 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${!isVendor ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <ShoppingBag size={16} /> I'm Shopping
            </button>
            <button 
              onClick={() => setIsVendor(true)}
              className={`flex-1 py-2.5 z-10 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${isVendor ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <Store size={16} /> I'm Selling
            </button>
          </div>

          {/* Mode Tabs (Login / Sign Up) */}
          <div className="flex gap-8 mb-8 w-full max-w-sm border-b border-zinc-200">
            <button 
              onClick={() => setIsLogin(true)}
              className={`pb-3 font-semibold text-lg transition-all border-b-2 px-2 ${isLogin ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`pb-3 font-semibold text-lg transition-all border-b-2 px-2 ${!isLogin ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
            >
              Create Account
            </button>
          </div>

          {/* Sliding Form Container */}
          <div className="w-full max-w-sm overflow-hidden relative">
            <div 
              className={`flex w-[200%] transition-transform duration-500 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-1/2'}`}
            >
              
              {/* --- LOGIN FORMS (Left Side of Slider) --- */}
              <div className="w-1/2 shrink-0 px-1">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-4">
                    <InputField 
                      icon={<Mail size={20} />} 
                      type="email" 
                      placeholder={isVendor ? "Business Email" : "Email Address"} 
                    />
                    <InputField 
                      icon={<Lock size={20} />} 
                      type="password" 
                      placeholder="Password" 
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4" />
                      <span className="text-sm text-zinc-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-zinc-900 hover:underline">Forgot password?</a>
                  </div>

                  <SubmitButton text={`Sign In to ${isVendor ? 'Dashboard' : 'Outfyt'}`} />

                  {/* Social Auth (Shoppers Only) */}
                  {!isVendor && (
                    <div className="pt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-zinc-500">Or continue with</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <SocialButton icon={<GoogleIcon />} text="Google" />
                        <SocialButton icon={<AppleIcon />} text="Apple" />
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* --- SIGN UP FORMS (Right Side of Slider) --- */}
              <div className="w-1/2 shrink-0 px-1">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Shopper Sign Up Fields */}
                  {!isVendor && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <InputField icon={<User size={20} />} type="text" placeholder="First Name" />
                        <InputField type="text" placeholder="Last Name" />
                      </div>
                      <InputField icon={<Mail size={20} />} type="email" placeholder="Email Address" />
                      <InputField icon={<Lock size={20} />} type="password" placeholder="Create Password" />
                      <p className="text-xs text-zinc-500 pt-2 leading-relaxed">
                        By creating an account, you agree to our <a href="#" className="text-zinc-900 underline">Terms of Service</a> and <a href="#" className="text-zinc-900 underline">Privacy Policy</a>.
                      </p>
                      <SubmitButton text="Create Account" />
                    </>
                  )}

                  {/* Vendor Sign Up Fields */}
                  {isVendor && (
                    <>
                      <InputField icon={<Store size={20} />} type="text" placeholder="Brand / Store Name" />
                      <InputField icon={<User size={20} />} type="text" placeholder="Contact Person" />
                      <InputField icon={<Mail size={20} />} type="email" placeholder="Business Email" />
                      <div className="grid grid-cols-2 gap-4">
                         <InputField icon={<Globe size={20} />} type="text" placeholder="Website" />
                         <InputField icon={<InstagramIcon />} type="text" placeholder="@handle" />
                      </div>
                      <InputField icon={<Lock size={20} />} type="password" placeholder="Create Password" />
                      
                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl mt-4">
                        <h4 className="text-sm font-semibold mb-1">Application Process</h4>
                        <p className="text-xs text-zinc-500">Our curation team reviews all vendor applications to ensure quality across the marketplace. You'll hear back within 24 hours.</p>
                      </div>

                      <SubmitButton text="Submit Application" />
                    </>
                  )}

                </form>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function InputField({ icon, type, placeholder }) {
  return (
    <div className="relative flex items-center group">
      {icon && (
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        style={{ minHeight: '52px', padding: '14px 16px', paddingLeft: icon ? '48px' : '16px' }}
        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
        required
      />
    </div>
  );
}

function SubmitButton({ text }) {
  return (
    <button 
      type="submit" 
      style={{ minHeight: '52px', padding: '14px 24px', marginTop: '16px', color: '#ffffff' }}
      className="w-full bg-zinc-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-transform active:scale-[0.98]"
    >
      {text}
      <ArrowRight size={18} />
    </button>
  );
}

function SocialButton({ icon, text }) {
  return (
    <button 
      type="button"
      style={{ minHeight: '48px', padding: '12px 16px' }}
      className="w-full flex items-center justify-center gap-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors"
    >
      {icon}
      {text}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.88 3.5-.84 1.58.11 2.78.7 3.52 1.83-3.04 1.77-2.5 5.82.52 7.06-1.04 2.76-2.19 3.73-2.62 4.14M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25" fill="currentColor"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}