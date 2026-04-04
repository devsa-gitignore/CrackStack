import { useState, useEffect } from 'react';
import { Sparkle as SparkleIcon } from 'lucide-react';
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
    <div className="w-[400px] h-full flex flex-col bg-zinc-900 border-l border-white/5 shadow-2xl relative z-20 font-sans">

      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 text-white p-2.5 rounded-lg border border-white/5 shadow-inner">
               <SparkleIcon size={16} />
            </div>
            <div>
              <h2 className="font-black text-white tracking-[0.22em] uppercase text-[10px]">Neural Stylist</h2>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.1em] mt-1.5">
                {!description && !clothBase64 ? (
                  <span className="text-zinc-400 font-black animate-pulse tracking-[0.22em]">Discovery mode active</span>
                ) : (
                  <>Protocol: <span className="text-zinc-500">{(description || garmentType || '').toUpperCase()}</span></>
                )}
              </p>
            </div>
          </div>

          {userContext && userContext.dimensions && (
            <div className="flex flex-col items-end gap-2 mt-0.5">
              <span className="text-[8px] text-zinc-700 uppercase font-black tracking-[0.22em]">Bio-Stats</span>
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-sm border border-white/10 shadow-xl"
                  style={{ backgroundColor: userContext.complexion }}
                  title="Complexion"
                />
                <div className="flex flex-col items-end">
                  <div className="bg-black/40 border border-white/5 rounded-md px-2 py-1 text-[9px] text-zinc-400 font-mono tracking-tighter" title="Dimensions">
                    {userContext.dimensions.shoulderWidth} : {userContext.dimensions.torsoHeight}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-6 gap-2">
        {[
          { id: 'shop', label: 'Match' },
          { id: 'style', label: 'Style' },
          { id: 'trend', label: 'Trend' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.22em] transition-all border ${activeTab === tab.id
                ? 'bg-white text-zinc-950 border-white shadow-xl'
                : 'bg-white/5 border-white/5 text-zinc-600 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 relative no-scrollbar">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md z-10">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-[9px] font-black uppercase tracking-widest">
            {error}. Standby.
          </div>
        )}

        {/* SHOP TAB (Feature 1) */}
        {activeTab === 'shop' && data.shop && (
          <div className="space-y-4">
            {data.style?.search_query && (
              <div className="p-5 bg-black border border-white/5 rounded-xl mb-6 shadow-inner">
                <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  Logic Context
                </p>
                <p className="text-xs text-zinc-300 italic font-medium leading-relaxed">"{data.style.search_query}"</p>
              </div>
            )}

            {data.shop.results?.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block p-5 rounded-xl border border-white/5 bg-zinc-800/20 hover:bg-zinc-800/40 transition group overflow-hidden shadow-xl"
              >
                <div className="flex gap-5">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-lg border border-white/5 group-hover:border-white/20 transition shadow-2xl"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white group-hover:text-zinc-400 transition line-clamp-1 text-[11px] uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-zinc-600 mt-2 line-clamp-2 leading-relaxed font-bold uppercase tracking-tighter">{item.content}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[8px] bg-white text-zinc-950 px-3 py-1.5 rounded font-black uppercase tracking-[0.22em]">Interface</span>
                  <span className="text-[9px] text-zinc-700 font-mono">{(item.score * 100).toFixed(0)}% Sync</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* STYLE TAB (Feature 2) */}
        {activeTab === 'style' && data.style && (
          <div className="space-y-8">

            {/* Custom Occasion Box */}
            <div className="p-5 bg-zinc-950 border border-white/5 rounded-xl shadow-2xl flex flex-col gap-3">
              <input
                type="text"
                placeholder="Declare Destination"
                value={targetOccasion}
                onChange={(e) => setTargetOccasion(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-800 outline-none focus:border-white/10 transition-all font-bold uppercase tracking-widest"
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
                  } catch (e) { }
                  setIsRegenerating(false);
                }}
                disabled={isRegenerating || !targetOccasion}
                className="w-full py-4 bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-20 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl transition border border-white/5 shadow-xl transition-all"
              >
                {isRegenerating ? 'Analyzing' : 'Execute Insight'}
              </button>
            </div>

            <div className="p-6 bg-black border border-white/5 rounded-xl shadow-inner relative overflow-hidden">
              <h3 className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em] mb-4 underline underline-offset-4 decoration-zinc-800">Styling Protocol</h3>
              <p className="text-zinc-200 text-xs leading-relaxed font-bold uppercase tracking-widest opacity-80 italic">"{data.style.style_tip}"</p>
            </div>

            {data.style.trends && data.style.trends.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.style.trends.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">Fabric Metrics</h3>
              <div className="p-6 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-3xl font-black text-white leading-none tracking-tighter">{recommendSize(calculateRealMeasurements(userContext?.dimensions))}</p>
                  <p className="text-[8px] text-zinc-600 font-black uppercase mt-3 tracking-[0.3em]">Neural Scale</p>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest leading-none">CM</p>
                  <p className="text-[11px] font-mono text-zinc-600">
                    S:{calculateRealMeasurements(userContext?.dimensions)?.shoulder || '--'}
                    <br />
                    T:{calculateRealMeasurements(userContext?.dimensions)?.torso || '--'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">Asset Pairings</h3>
               <div className="space-y-2.5">
                 {data.style.outfit_pairings?.map((pairing, i) => (
                   <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-4 transition-all hover:bg-white/10 group">
                     <span className="text-zinc-600 text-[11px] mt-0.5 group-hover:text-white transition-colors"></span>
                     <div className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-widest">
                       {typeof pairing === 'string' ? (
                         <span>{pairing}</span>
                       ) : (
                         Object.entries(pairing).map(([key, value]) => (
                           <div key={key}>
                             <span className="font-black text-zinc-600 pr-1">{key} : </span>
                             <span>{value}</span>
                           </div>
                         ))
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* TRENDS TAB (Feature 3) */}
        {activeTab === 'trend' && data.trend && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-zinc-950 border border-white/5 shadow-inner">
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-3">Aesthetic</p>
                <h4 className="font-black text-zinc-400 truncate text-[10px] uppercase tracking-tighter" title={data.trend.design_language}>{data.trend.design_language}</h4>
              </div>
              <div className="p-5 rounded-xl bg-zinc-950 border border-white/5 shadow-inner">
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-3">Target Icon</p>
                <h4 className="font-black text-zinc-400 truncate text-[10px] uppercase tracking-tighter" title={data.trend.style_icon}>{data.trend.style_icon}</h4>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-black border border-white/5 shadow-2xl">
              <h3 className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em] mb-4">Neural Data Pulse</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold uppercase tracking-widest italic opacity-80">"{data.trend.trend_match}"</p>
            </div>

            <div className="space-y-5">
              <h3 className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">Social Index</h3>
              <div className="flex flex-wrap gap-2">
                {data.trend.trending_now?.map((trend, i) => (
                  <span key={i} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.22em] shadow-xl border border-white/5">
                    {trend}
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
