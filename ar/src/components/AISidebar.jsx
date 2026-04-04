import { useState, useEffect } from 'react';
import { calculateRealMeasurements, recommendSize, getFitAnalysis } from '../utils/sizeCalculator';

const API_BASE = 'http://localhost:5000/api';

/**
 * Heuristics to derive AI style preferences from a text occasion string.
 */
function deriveStyleProfile(occasion = '', userContext = null) {
  const occ = occasion.toLowerCase();
  
  // Defaults
  let colors = ['neutrals'];
  let types = ['casual'];
  
  if (occ.includes('party') || occ.includes('club')) {
    colors = ['vibrant', 'black', 'metallics'];
    types = ['party wear', 'modern'];
  } else if (occ.includes('wedding') || occ.includes('marriage') || occ.includes('festive') || occ.includes('diwali')) {
    colors = ['traditional red', 'gold', 'royal blue', 'emeralds'];
    types = ['ethnic', 'formal traditional'];
  } else if (occ.includes('interview') || occ.includes('office') || occ.includes('meeting') || occ.includes('corporate')) {
    colors = ['navy', 'charcoal', 'off-white'];
    types = ['business formal', 'smart casual'];
  } else if (occ.includes('date') || occ.includes('brunch')) {
    colors = ['pastels', 'earthy tones'];
    types = ['smart casual', 'chic'];
  } else if (occ.includes('gym') || occ.includes('workout') || occ.includes('outdoor')) {
    colors = ['neon', 'dark grays', 'blacks'];
    types = ['activewear', 'breathable'];
  }

  return {
    preferredColors: colors,
    clothTypes: types,
    complexion: userContext?.complexion || 'unknown',
    bodyProportions: userContext?.dimensions || 'unknown'
  };
}

export default function AISidebar({ garmentType, description, userContext, clothBase64 }) {
  const [activeTab, setActiveTab] = useState('shop');
  const [data, setData] = useState({ shop: null, style: null, trend: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Custom Occasion state for Style tab
  const [targetOccasion, setTargetOccasion] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Refetch when garment changes
  useEffect(() => {
    setData({ shop: null, style: null, trend: null });
  }, [description, garmentType]);

  // Auto-fetch data when tab changes or garment changes
  useEffect(() => {
    // IF we are in the shop tab but have no AI analysis yet, we wait for style first
    if (activeTab === 'shop' && !data.style && clothBase64) {
       setActiveTab('style'); // Switch to style first for analysis!
    }

    if (data[activeTab]) return; // Already fetched for this specific garment

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint = '';
        let payload = {};

        const garmentId = description || garmentType || 'Trending Fashion';
        const isDefault = !description && !garmentType;

        if (activeTab === 'shop') {
          endpoint = '/find-similar';
          // Use AI Search Query if available, else fallback
          // If no image, we do a broad "Discovery" search
          payload = { query: data.style?.search_query || (isDefault ? 'Trending Summer Outfits 2024' : garmentId) };
        } else if (activeTab === 'style') {
          endpoint = '/style-suggest';
          payload = {
            currentCloth: garmentId,
            image: clothBase64,
            isDiscovery: isDefault,
            isDiscovery: isDefault,
            targetOccasion, // Include if user typed something
            styleProfile: deriveStyleProfile(targetOccasion, userContext)
          };
        } else if (activeTab === 'trend') {
          endpoint = '/trend-analysis';
          payload = { 
            garmentDescription: garmentId,
            userContext,
            image: clothBase64,
            isDiscovery: isDefault
          };
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const result = await response.json();
        
        setData(prev => ({
          ...prev,
          [activeTab]: result
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, description, garmentType, data, clothBase64]);

  // The AI is always "Online" but in standby if no garment is actively selected
  const activeDescription = description || garmentType || 'Casual Outfit';

  return (
    <div className="w-[380px] h-full flex flex-col bg-[#0b0f19] border-l border-white/10 shadow-2xl relative z-20">
      
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl">✨</div>
            <div>
              <h2 className="font-bold text-white tracking-tight">AI Stylist</h2>
              <p className="text-xs text-gray-400 font-medium italic">
                {!description && !clothBase64 ? (
                  <span className="text-indigo-400 font-bold animate-pulse">DISCOVERY MODE ACTIVE</span>
                ) : (
                  <>Analyzing: <span className="text-gray-300">{(description || garmentType || '').toUpperCase()}</span></>
                )}
              </p>
            </div>
          </div>

          {userContext && userContext.dimensions && (
            <div className="flex flex-col items-end gap-1.5 mt-0.5">
              <span className="text-[9px] text-indigo-400/80 uppercase font-bold tracking-widest">Live Bio-Metrics</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white/10 shadow-sm" 
                  style={{backgroundColor: userContext.complexion}}
                  title="Detected Skin Tone"
                />
                <div className="flex flex-col items-end">
                  <div className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-gray-300 font-mono tracking-tighter" title="Shoulder Width × Torso Height">
                    {userContext.dimensions.shoulderWidth}W × {userContext.dimensions.torsoHeight}H
                  </div>
                  {userContext.dimensions.eyeDistance > 0 && (
                    <div className="text-[9px] text-indigo-300/60 font-mono mt-0.5" title="Detected Eye Distance (Reference Scale)">Ref: {userContext.dimensions.eyeDistance}px</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-2">
        {[
          { id: 'shop', label: '🛒 Shop Match' },
          { id: 'style', label: '👔 Suggestions' },
          { id: 'trend', label: '📈 Trends' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0f19]/80 backdrop-blur-sm z-10">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}. Using fallback UI state.
          </div>
        )}

        {/* SHOP TAB (Feature 1) */}
        {activeTab === 'shop' && data.shop && (
          <div className="space-y-4">
            {data.style?.search_query && (
               <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mb-4">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-glow"></span>
                    AI Context Match
                  </p>
                  <p className="text-xs text-indigo-200 italic font-medium">"{data.style.search_query}"</p>
               </div>
            )}

            {data.shop.results?.map((item, idx) => (
              <a 
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition group overflow-hidden"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-lg border border-white/10 group-hover:border-indigo-500/50 transition shadow-sm" 
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-indigo-300 transition line-clamp-1 text-sm">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">View Product</span>
                  <span className="text-[10px] text-gray-500 font-mono">{(item.score * 100).toFixed(0)}% Match</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* STYLE TAB (Feature 2) */}
        {activeTab === 'style' && data.style && (
          <div className="space-y-6">
            
            {/* Custom Occasion Box */}
            <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Going somewhere? (e.g. Diwali Party)" 
                value={targetOccasion}
                onChange={(e) => setTargetOccasion(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
              />
              <button 
                onClick={async () => {
                  if (!targetOccasion) return;
                  setIsRegenerating(true);
                  try {
                    const res = await fetch(`${API_BASE}/style-suggest`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        currentCloth: description || garmentType,
                        image: clothBase64,
                        targetOccasion,
                        styleProfile: deriveStyleProfile(targetOccasion, userContext)
                      })
                    });
                    const result = await res.json();
                    setData(d => ({ ...d, style: result }));
                  } catch(e) {}
                  setIsRegenerating(false);
                }}
                disabled={isRegenerating || !targetOccasion}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {isRegenerating ? '...' : 'Ask AI'}
              </button>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl">
              <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Pro Style Tip</h3>
              <p className="text-white text-sm leading-relaxed">{data.style.style_tip}</p>
            </div>

            {data.style.trends && data.style.trends.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.style.trends.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    🔥 {t}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Size Recommendation</h3>
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-white">{recommendSize(calculateRealMeasurements(userContext?.dimensions))}</p>
                  <p className="text-[10px] text-indigo-300/70 font-bold uppercase mt-0.5">Best Fit for Your Frame</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Measurements (Est.)</p>
                  <p className="text-sm font-mono text-gray-200">
                    S: {calculateRealMeasurements(userContext?.dimensions)?.shoulder || '--'}cm
                    <br/>
                    T: {calculateRealMeasurements(userContext?.dimensions)?.torso || '--'}cm
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 leading-relaxed italic">
                {getFitAnalysis(calculateRealMeasurements(userContext?.dimensions), recommendSize(calculateRealMeasurements(userContext?.dimensions)))}
              </p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Best Occasions</h3>
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-gray-200 text-sm">
                {data.style.occasion}
              </div>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Outfit Pairings</h3>
              <ul className="space-y-3">
                {data.style.outfit_pairings?.map((pairing, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-indigo-400 mt-0.5">✦</span>
                    <div className="flex flex-col gap-1">
                      {typeof pairing === 'string' ? (
                        <span>{pairing}</span>
                      ) : (
                        Object.entries(pairing).map(([key, value]) => (
                          <div key={key}>
                            <span className="capitalize font-semibold text-gray-400">{key}: </span>
                            <span>{value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TRENDS TAB (Feature 3) */}
        {activeTab === 'trend' && data.trend && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Aesthetic</p>
                <h4 className="font-semibold text-white truncate" title={data.trend.design_language}>{data.trend.design_language}</h4>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Style Icon</p>
                <h4 className="font-semibold text-white truncate" title={data.trend.style_icon}>{data.trend.style_icon}</h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Trend Match</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{data.trend.trend_match}</p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Currently Trending</h3>
              <div className="flex flex-wrap gap-2">
                {data.trend.trending_now?.map((trend, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-medium">
                    #{trend}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
