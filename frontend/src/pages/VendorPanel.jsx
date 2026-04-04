import React, { useState } from 'react';
import { AreaChart, Package, Upload, LayoutDashboard, Plus, ChevronLeft, ArrowUpRight, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const initialProducts = [
  { 
    id: 1, 
    name: 'Midnight Silk Kurta', 
    category: 'Kurta', 
    price: '₹3,499', 
    img: 'https://images.unsplash.com/photo-1583307132230-da760ee48af4?w=400', 
    tag: 'Trending',
    tryOns: 420,
    engagement: '85%',
    conversion: 'High',
    bestFor: 'Festive',
    styleType: 'Ethnic Elegance',
    targetAudience: 'Men, 20-35',
    usedIn: 145,
    pairedWith: 'White Churidar, Gold Watch'
  },
  { 
    id: 2, 
    name: 'Rider Denim Jacket', 
    category: 'Jacket', 
    price: '₹4,999', 
    img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 
    tag: 'Popular',
    tryOns: 310,
    engagement: '78%',
    conversion: 'Medium',
    bestFor: 'College',
    styleType: 'Casual Streetwear',
    targetAudience: 'Unisex, 18-28',
    usedIn: 89,
    pairedWith: 'Black Tee, Cargo Pants'
  },
  { 
    id: 3, 
    name: 'Classic White Tee', 
    category: 'T-Shirt', 
    price: '₹999', 
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 
    tag: '',
    tryOns: 850,
    engagement: '92%',
    conversion: 'High',
    bestFor: 'Casual',
    styleType: 'Minimalist',
    targetAudience: 'Everyone',
    usedIn: 520,
    pairedWith: 'Blue Jeans, Sneakers'
  },
  { 
    id: 4, 
    name: 'Royal Sherwani Set', 
    category: 'Sherwani', 
    price: '₹14,999', 
    img: 'https://www.sudarshansaree.com/cdn/shop/products/ETW1539-1674.jpg?v=1679647570', 
    tag: 'Festive Pick',
    tryOns: 120,
    engagement: '65%',
    conversion: 'Medium',
    bestFor: 'Wedding',
    styleType: 'Traditional Luxe',
    targetAudience: 'Men, 25-40',
    usedIn: 45,
    pairedWith: 'Mojaris, Turban'
  },
];

export default function VendorPanel() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, catalog, upload
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Upload Form State
  const [uploadData, setUploadData] = useState({ name: '', img: '', category: 'Kurta', price: '', link: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Computed Dashboard Metrics
  const totalProducts = products.length;
  const totalTryOns = products.reduce((acc, p) => acc + (p.tryOns || 0), 0);
  const topCategory = 'Kurta'; // Hardcoded for demo
  const mostPopular = products.sort((a, b) => b.tryOns - a.tryOns)[0]?.name || 'Classic White Tee';

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.name || !uploadData.price) return;
    
    // Simulate image handling
    const newProduct = {
      id: Date.now(),
      name: uploadData.name,
      category: uploadData.category,
      price: `₹${uploadData.price}`,
      img: uploadData.img || 'https://images.unsplash.com/photo-1598533023411-2d7c0f1c3f8d?w=400', // fallback
      tag: 'New Arrival',
      tryOns: 0,
      engagement: '0%',
      conversion: 'Pending',
      bestFor: uploadData.category === 'Kurta' ? 'Festive' : 'Casual',
      styleType: 'Newly Added',
      targetAudience: 'General',
      usedIn: 0,
      pairedWith: 'TBD'
    };
    
    setProducts([newProduct, ...products]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadData({ name: '', img: '', category: 'Kurta', price: '', link: '' });
      setActiveTab('catalog');
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({ ...uploadData, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 pb-24 font-sans">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="flex items-center text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft size={24} /> <span className="ml-2 font-bold tracking-tight">Back to Catalog</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 pt-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/5 shrink-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 sticky top-24">
                <img 
                  src={selectedProduct.img} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tighter mb-2">{selectedProduct.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-zinc-500">{selectedProduct.price}</span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Try-ons</p>
                  <p className="text-2xl font-black">{selectedProduct.tryOns}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Engagement</p>
                  <p className="text-2xl font-black">{selectedProduct.engagement}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Conversion Likelihood</p>
                  <p className="text-xl font-bold text-zinc-700">{selectedProduct.conversion}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Target Audience</p>
                  <p className="text-sm font-bold text-zinc-700 mt-1">{selectedProduct.targetAudience}</p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-bold flex items-center gap-2"><AreaChart size={18} className="text-zinc-400"/> AI Styling Insights</h2>
                <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl shadow-zinc-900/10">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                      <span className="text-zinc-400 text-sm">Best Occasion</span>
                      <span className="font-bold">{selectedProduct.bestFor}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                      <span className="text-zinc-400 text-sm">Style Type</span>
                      <span className="font-bold">{selectedProduct.styleType}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-zinc-400 text-sm">Often Paired With</span>
                      <span className="font-bold text-zinc-200">{selectedProduct.pairedWith}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Insight */}
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-1">High Outfit Inclusion</h3>
                  <p className="text-sm text-emerald-800/80 leading-relaxed">
                    This item has been included in <strong>{selectedProduct.usedIn} outfits</strong> saved by users this week. Suggest increasing stock before the weekend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-24 font-sans">
      
      {/* Header & Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black tracking-tighter">Vendor Panel<span className="text-zinc-400">.</span></h1>
            <Link to="/home" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1">
              Exit <ArrowUpRight size={14}/>
            </Link>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16}/> },
              { id: 'catalog', label: 'Catalog', icon: <Package size={16}/> },
              { id: 'upload', label: 'Upload Product', icon: <Upload size={16}/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 transition-all ${
                  activeTab === tab.id 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-xl font-bold tracking-tight">Overview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-start mb-4 text-zinc-400"><Package size={20}/></div>
                <h3 className="text-3xl font-black tracking-tight">{totalProducts}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">Total Products</p>
              </div>
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-start mb-4 text-zinc-400"><Users size={20}/></div>
                <h3 className="text-3xl font-black tracking-tight">{totalTryOns}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">Total Try-ons</p>
              </div>
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 col-span-2 md:col-span-1">
                <div className="flex justify-between items-start mb-4 text-zinc-400"><TrendingUp size={20}/></div>
                <h3 className="text-xl font-black tracking-tight truncate pb-1">{mostPopular}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">Top Item</p>
              </div>
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 col-span-2 md:col-span-1">
                <div className="flex justify-between items-start mb-4 text-zinc-400"><AreaChart size={20}/></div>
                <h3 className="text-2xl font-black tracking-tight pb-1">{topCategory}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">Top Category</p>
              </div>
            </div>

            <div className="bg-zinc-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-zinc-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10 max-w-lg">
                <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-4 text-zinc-300">
                  Trending Insight
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                  Your <span className="text-zinc-300">kurtas</span> are trending heavily during festive occasions.
                </h2>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  User data shows a 45% increase in virtual try-ons for ethnic wear in the evenings. Consider adding more color variants for the Royal Sherwani Set.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">Your Catalog</h2>
              <button onClick={() => setActiveTab('upload')} className="text-sm font-bold bg-zinc-100 px-4 py-2 rounded-xl text-zinc-900 hover:bg-zinc-200 transition-colors">
                + Add New
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200/50 group-hover:border-zinc-300 transition-colors">
                    <img 
                      src={product.img} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.tag && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {product.tag}
                      </div>
                    )}
                    
                    {/* Quick Action Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
                      <button className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors shadow-lg">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-1">
                    <h3 className="text-sm font-bold truncate group-hover:text-zinc-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-semibold text-zinc-400">{product.category}</span>
                      <span className="text-sm font-black">{product.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight mb-6">Add to Catalog</h2>
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 md:p-8">
              <form onSubmit={handleUpload} className="space-y-6">
                
                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product Image</label>
                  <div className="border-2 border-dashed border-zinc-300 rounded-2xl relative overflow-hidden bg-white hover:bg-zinc-50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {uploadData.img ? (
                      <div className="aspect-[3/4] max-h-80 w-full mx-auto relative">
                        <img src={uploadData.img} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        <Upload size={32} className="mb-3" />
                        <span className="font-semibold text-sm">Click to upload product image</span>
                        <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={uploadData.name}
                      onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                      placeholder="e.g. Royal Blue Sherwani"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Cloth Type</label>
                    <select 
                      value={uploadData.category}
                      onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    >
                      <option value="Kurta">Kurta</option>
                      <option value="Jacket">Jacket</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Jeans">Jeans</option>
                      <option value="Pants">Pants</option>
                      <option value="Sherwani">Sherwani</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={uploadData.price}
                      onChange={(e) => setUploadData({...uploadData, price: e.target.value})}
                      placeholder="e.g. 2999"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product Link (Optional)</label>
                    <input 
                      type="url" 
                      value={uploadData.link}
                      onChange={(e) => setUploadData({...uploadData, link: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={uploadSuccess}
                  className="w-full mt-4 bg-zinc-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 group disabled:opacity-80"
                >
                  {uploadSuccess ? (
                    <><CheckCircle2 size={18} className="text-emerald-400"/> Added Successfully</>
                  ) : (
                    <><Plus size={18} className="group-hover:scale-110 transition-transform"/> Add to Catalog</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
