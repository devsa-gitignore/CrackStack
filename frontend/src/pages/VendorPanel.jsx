import React, { useState } from "react";
import {
  AreaChart,
  Package,
  Upload,
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Bell,
  MessageSquare,
  Store,
  Search,
  Filter,
  Activity,
  Eye,
  MousePointerClick,
  BarChart3,
  Star,
  Zap,
  Clock,
  GripHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

const initialProducts = [
  {
    id: 1,
    name: "Midnight Silk Kurta",
    category: "Kurta",
    price: "₹3,499",
    img: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=400",
    status: "Active",
    views: "12.4k",
    tryOns: 420,
    conversion: "4.2%",
    stock: 45,
  },
  {
    id: 2,
    name: "Rider Denim Jacket",
    category: "Jacket",
    price: "₹4,999",
    img: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400",
    status: "Active",
    views: "8.1k",
    tryOns: 310,
    conversion: "3.8%",
    stock: 12,
  },
  {
    id: 3,
    name: "Classic White Tee",
    category: "T-Shirt",
    price: "₹999",
    img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400",
    status: "Low Stock",
    views: "18.2k",
    tryOns: 850,
    conversion: "6.1%",
    stock: 4,
  },
  {
    id: 4,
    name: "Royal Sherwani Set",
    category: "Sherwani",
    price: "₹14,999",
    img: "https://images.unsplash.com/photo-1614031679201-9257ab718a38?w=400",
    status: "Draft",
    views: "1.2k",
    tryOns: 145,
    conversion: "2.1%",
    stock: 0,
  },
];

const chartData = [132, 118, 145, 162, 178, 221, 205];
const prevData = [110, 125, 130, 140, 155, 190, 180];
const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const chartFullDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const chartChanges = [
  "+2.1%",
  "-10.6%",
  "+22.8%",
  "+11.7%",
  "+9.8%",
  "+24.1%",
  "-7.2%",
];


export default function VendorPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoverIndex, setHoverIndex] = useState(null);


  // Upload Form State
  const [uploadData, setUploadData] = useState({
    name: "",
    img: "",
    category: "Kurta",
    price: "",
    link: "",
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Computed Dashboard Metrics
  const totalProducts = products.length;
  const totalTryOns = products.reduce((acc, p) => acc + (p.tryOns || 0), 0);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.name || !uploadData.price) return;

    const newProduct = {
      id: Date.now(),
      name: uploadData.name,
      category: uploadData.category,
      price: `₹${uploadData.price}`,
      img:
        uploadData.img ||
        "https://images.unsplash.com/photo-1598533023411-2d7c0f1c3f8d?w=400",
      status: "Active",
      views: "0",
      tryOns: 0,
      conversion: "0%",
      stock: 50,
    };

    setProducts([newProduct, ...products]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadData({
        name: "",
        img: "",
        category: "Kurta",
        price: "",
        link: "",
      });
      setActiveTab("catalog");
    }, 1000);
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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans pb-20">
      {/* Utility Top Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Store size={20} className="text-zinc-700" /> outfyt{" "}
              <span className="font-normal text-zinc-400">Merchant</span>
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-md border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
              <span className="text-xs font-medium text-zinc-600">
                Store Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                setActiveTab("notifications");
                setSelectedProduct(null);
              }}
              className="relative text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
            </button>
            <div className="w-px h-6 bg-zinc-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-tight">
                  Elevate Studio
                </p>
                <p className="text-xs text-zinc-500 leading-tight">
                  Vendor ID: #8849
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-zinc-100 ring-offset-1">
                ES
              </div>
            </div>
            <Link
              to="/home"
              className="ml-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              Exit <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-100 bg-white">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {[
              {
                id: "dashboard",
                label: "Overview",
                icon: <LayoutDashboard size={15} />,
              },
              { id: "catalog", label: "Products", icon: <Package size={15} /> },
              { id: "upload", label: "Upload", icon: <Upload size={15} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedProduct(null);
                }}
                className={`flex items-center gap-2 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-5">

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && !selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Products",
                  value: totalProducts,
                  trend: "+2",
                  icon: <Package size={16} className="text-zinc-400" />,
                },
                {
                  title: "Total Try-ons",
                  value: totalTryOns.toLocaleString(),
                  trend: "+14%",
                  icon: <Eye size={16} className="text-zinc-400" />,
                },
                {
                  title: "Avg. Conversion Rate",
                  value: "4.8%",
                  trend: "+0.3%",
                  icon: (
                    <MousePointerClick size={16} className="text-zinc-400" />
                  ),
                },
                {
                  title: "Top Category",
                  value: "Kurtas",
                  subInfo: "42% of volume",
                  icon: <Star size={16} className="text-zinc-400" />,
                },
              ].map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-zinc-300 transition-all cursor-default group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">
                      {kpi.title}
                    </p>
                    {kpi.icon}
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-zinc-900 group-hover:scale-105 transition-transform origin-left">
                      {kpi.value}
                    </h3>
                    {kpi.trend ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <TrendingUp size={10} /> {kpi.trend}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500">
                        {kpi.subInfo}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Analytics Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              {/* Trends Graph Panel */}
              <div className="relative flex flex-col overflow-hidden bg-white border shadow-sm p-5 rounded-xl border-zinc-200 lg:col-span-3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Try-on Engagement</h3>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-emerald-600">+18.4% vs last week</span>
                      <span className="text-[10px] text-zinc-400 font-medium pb-0.5 border-l border-zinc-200 pl-2">Peak: Sat (221)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 mr-4 text-[10px] font-medium text-zinc-400">
                      <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-zinc-900 rounded-full"></span> This week</div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 border-t border-zinc-300 border-dashed"></span> Last week</div>
                    </div>
                    <select className="text-[10px] font-bold border border-zinc-200 rounded px-2 py-1 text-zinc-600 bg-zinc-50 focus:outline-none cursor-pointer">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                </div>
                
                {/* Real Analytics Chart Container */}
                <div className="relative flex-1 w-full min-h-[180px] mt-2 mb-6">
                  {/* Y-Axis Labels */}
                  <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between text-[9px] text-zinc-400 font-mono text-right w-6 pointer-events-none">
                    <span>250</span>
                    <span>150</span>
                    <span>50</span>
                    <span>0</span>
                  </div>

                  {/* Try-ons vertical label */}
                  <div className="absolute hidden -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-zinc-300 uppercase tracking-widest sm:block">
                    Try-ons
                  </div>

                  {/* Chart Area */}
                  <div className="absolute top-0 bottom-0 left-8 right-2">
                    {/* Horizontal Gridlines */}
                    <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full h-px border-t border-zinc-100"></div>
                      <div className="w-full h-px border-t border-zinc-100"></div>
                      <div className="w-full h-px border-t border-zinc-100"></div>
                      <div className="w-full h-px border-t border-zinc-200"></div>
                    </div>

                    <svg className="relative w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="analyticalFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#18181b" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Reference line (Last week) */}
                      <path 
                        d="M0,25.33 L16.67,23.33 L33.33,22.67 L50,21.33 L66.67,19.33 L83.33,14.67 L100,16" 
                        fill="none" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="2 1" 
                      />

                      {/* Area Fill */}
                      <path 
                        d="M0,22.4 L16.67,24.27 L33.33,20.67 L50,18.4 L66.67,16.27 L83.33,10.53 L100,12.67 L100,40 L0,40 Z" 
                        fill="url(#analyticalFill)" 
                      />

                      {/* Main Data Line */}
                      <path 
                        d="M0,22.4 L16.67,24.27 L33.33,20.67 L50,18.4 L66.67,16.27 L83.33,10.53 L100,12.67" 
                        fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinejoin="miter" strokeLinecap="butt" 
                      />

                      {/* Interaction Vertical Line */}
                      {hoverIndex !== null && (
                        <line 
                          x1={hoverIndex * 16.67} y1="0" x2={hoverIndex * 16.67} y2="40" 
                          stroke="#d4d4d8" strokeWidth="0.5" strokeDasharray="1 1"
                        />
                      )}

                      {/* Hover Dot */}
                      {hoverIndex !== null && (
                        <circle 
                        cx={hoverIndex * 16.67} 
                        cy={40 - (chartData[hoverIndex] / 300 * 40)} 
                        r="2.5" fill="white" stroke="#18181b" strokeWidth="1.5" 
                        />
                      )}

                      {/* Hover Invisible Targets */}
                      {chartLabels.map((_, i) => (
                        <rect 
                          key={i} 
                          x={i * 16.67 - 8.33} y="0" width="16.67" height="40" 
                          fill="transparent" 
                          onMouseEnter={() => setHoverIndex(i)} 
                          onMouseLeave={() => setHoverIndex(null)}
                          className="cursor-crosshair"
                        />
                      ))}
                    </svg>

                    {/* X-axis Labels */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-zinc-400 font-medium translate-y-5">
                      {chartLabels.map((l, i) => (
                        <span key={i} className={`w-8 text-center -ml-4 transition-colors ${hoverIndex === i ? "text-zinc-900 bold" : ""}`}>{l}</span>
                      ))}
                    </div>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoverIndex !== null && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0 }}
                          className="absolute pointer-events-none bg-zinc-900 text-white p-2 rounded shadow-xl z-50 flex flex-col gap-0.5 min-w-[80px]"
                          style={{ 
                            left: `${hoverIndex * 16.67}%`, 
                            top: `${40 - (chartData[hoverIndex]/300*40) * 10}%`,
                            transform: `translate(${hoverIndex > 4 ? "-110%" : "10%"}, -120%)`
                          }}
                        >
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{chartFullDays[hoverIndex]}</p>
                          <p className="text-xs font-bold font-mono">{chartData[hoverIndex]} <span className="text-[9px] font-normal text-zinc-300">try-ons</span></p>
                          <p className={`text-[9px] font-bold ${chartChanges[hoverIndex].startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                            {chartChanges[hoverIndex]} <span className="text-zinc-500 font-medium">vs prev</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* AI Actionable Insights Panel */}
              <div className="flex flex-col lg:col-span-2">
                <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex-1">
                  
                  {/* Header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-zinc-400" />
                      <h3 className="text-sm font-semibold text-zinc-900">System Insights (Beta)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="flex h-2 w-2 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </span>
                       <span className="text-[10px] text-zinc-500 font-medium">Analyzed 2 mins ago</span>
                    </div>
                  </div>

                  {/* Body: Insights List */}
                  <div className="flex-1 overflow-y-auto w-full divide-y divide-zinc-100">
                    
                    {/* Insight 1 */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xs font-bold text-zinc-900">Weekend engagement spike detected</h4>
                        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">Spike</span>
                      </div>
                      
                      <div className="space-y-2 mb-1 mt-3">
                        <div className="flex justify-start gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0 pt-0.5">Reason</span>
                           <p className="text-xs text-zinc-700 font-medium">Try-ons increased from <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">178</span> (Fri) to <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">221</span> (Sat) <span className="mx-1 text-zinc-300">&rarr;</span> <span className="text-emerald-600 font-bold">+24%</span></p>
                        </div>
                        <div className="flex justify-start gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0 pt-0.5">Action</span>
                           <p className="text-xs text-zinc-900 font-bold">Increase visibility of ethnic wear on weekends</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0">Signal</span>
                           <div className="flex items-center gap-0.5">
                             <div className="w-1.5 h-3 bg-emerald-500 rounded-[1px]"></div>
                             <div className="w-1.5 h-3 bg-emerald-500 rounded-[1px]"></div>
                             <div className="w-1.5 h-3 bg-emerald-500 rounded-[1px]"></div>
                             <span className="text-[10px] font-bold text-zinc-900 ml-1.5">HIGH</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Insight 2 */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xs font-bold text-zinc-900">Product drop-off risk</h4>
                        <span className="px-2 py-0.5 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-[9px] font-bold uppercase tracking-wider">Risk</span>
                      </div>
                      
                      <div className="space-y-2 mb-1 mt-3">
                        <div className="flex justify-start gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0 pt-0.5">Reason</span>
                           <p className="text-xs text-zinc-700 font-medium">Sherwani Set shows <span className="font-mono bg-red-50 text-red-700 border border-red-200 px-1 py-0.5 rounded">85%</span> abandonment after try-on</p>
                        </div>
                        <div className="flex justify-start gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0 pt-0.5">Action</span>
                           <p className="text-xs text-zinc-900 font-bold">Add side-view images or improve fit preview</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-semibold text-zinc-400 uppercase w-12 shrink-0">Signal</span>
                           <div className="flex items-center gap-0.5">
                             <div className="w-1.5 h-3 bg-amber-500 rounded-[1px]"></div>
                             <div className="w-1.5 h-3 bg-amber-500 rounded-[1px]"></div>
                             <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px]"></div>
                             <span className="text-[10px] font-bold text-zinc-400 ml-1.5">MED</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center mt-auto">
                     <span className="text-[10px] text-zinc-400 font-medium">Based on last 7 days data</span>
                     <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded shadow-sm text-[10px] font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
                       Regenerate <Activity size={10} />
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Row */}
            {/* Bottom Row */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 pb-10 mt-6">
              
              {/* Elegant Top Products Table */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 md:px-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <div>
                    <h3 className="font-semibold text-zinc-900">Top Performing Catalog</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Metrics based on last 7 days of virtual try-on activity.</p>
                  </div>
                  <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-wider px-3 py-1.5 border border-zinc-200 rounded-md bg-white shadow-sm">View Full Catalog</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-white border-b border-zinc-100 font-bold">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Product Identity</th>
                        <th className="px-6 py-4 font-semibold text-right">Try-on Volume</th>
                        <th className="px-6 py-4 font-semibold text-right">Conversion Shift</th>
                        <th className="px-6 py-4 font-semibold text-right">Inventory Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {products.map((p) => (
                        <tr key={p.id} className="transition-colors cursor-pointer hover:bg-zinc-50 group" onClick={() => setSelectedProduct(p)}>
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded border border-zinc-200 overflow-hidden shrink-0 bg-zinc-100">
                              <img src={p.img} alt="" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"/>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-800 transition-colors group-hover:text-emerald-700">
                                {p.name}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium mt-0.5">{p.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-bold text-zinc-700">{p.tryOns}</span>
                            <span className="text-zinc-400 text-[10px] ml-1 uppercase tracking-wider block sm:inline">sessions</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-mono font-bold ${parseFloat(p.conversion) > 5 ? 'text-emerald-600' : 'text-zinc-700'}`}>
                              {p.conversion}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border
                              ${p.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                                p.status === 'Low Stock' ? "bg-orange-50 text-orange-700 border-orange-200" : 
                                "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CATALOG / PRODUCTS TAB */}
        {activeTab === "catalog" && !selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Catalog Controls */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 bg-white rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <Filter size={16} /> Filter
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {filteredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="group bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden border-b border-zinc-100">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border shadow-sm backdrop-blur-md
                        ${
                          product.status === "Active"
                            ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                            : product.status === "Low Stock"
                              ? "bg-yellow-50/90 text-yellow-700 border-yellow-200"
                              : "bg-zinc-100/90 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1 mb-3">
                      <span className="text-xs text-zinc-500">
                        {product.category}
                      </span>
                      <span className="text-sm font-bold text-zinc-900">
                        {product.price}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3">
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                          Try-ons
                        </p>
                        <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                          {product.tryOns}
                        </p>
                      </div>
                      <div className="text-center border-l border-zinc-100">
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                          Conv.
                        </p>
                        <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                          {product.conversion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center text-zinc-500">
                No products found matching your search.
              </div>
            )}
          </motion.div>
        )}

        {/* DETAILS VIEW (Triggered from anywhere) */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
            >
              <ChevronLeft size={16} /> Back to view
            </button>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-[400px] shrink-0 border-r border-zinc-100 bg-zinc-50 flex flex-col justify-center">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              </div>

              <div className="p-6 md:p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider
                        ${
                          selectedProduct.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : selectedProduct.status === "Low Stock"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {selectedProduct.status}
                      </span>
                      <span className="text-xs font-medium text-zinc-500">
                        {selectedProduct.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 mb-1">
                      {selectedProduct.name}
                    </h1>
                    <p className="text-2xl font-semibold text-zinc-700">
                      {selectedProduct.price}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                      Edit Item
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-zinc-100 mb-8">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Views
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {selectedProduct.views || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Try-ons
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {selectedProduct.tryOns || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Conversion
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {selectedProduct.conversion || "0%"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Stock Left
                    </p>
                    <p
                      className={`text-lg font-bold ${selectedProduct.stock < 10 ? "text-red-500" : "text-zinc-900"}`}
                    >
                      {selectedProduct.stock || "0"}
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-zinc-400" /> Styling
                  Metrics
                </h3>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between items-center bg-white p-3 border border-zinc-100 rounded-lg">
                    <span className="text-sm font-medium text-zinc-500">
                      Often paired with
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {selectedProduct.pairedWith || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 border border-zinc-100 rounded-lg">
                    <span className="text-sm font-medium text-zinc-500">
                      Top Occasion Trigger
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {selectedProduct.bestFor || "General Use"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === "upload" && !selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pb-10"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Add New Product
            </h2>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-zinc-300 rounded-xl relative overflow-hidden bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {uploadData.img ? (
                      <div className="aspect-[3/4] max-h-64 w-max mx-auto relative p-4">
                        <img
                          src={uploadData.img}
                          alt="Preview"
                          className="h-full object-contain rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium text-xs bg-zinc-900/80 px-3 py-1.5 rounded-md backdrop-blur-sm shadow-sm border border-zinc-700">
                            Change Photo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                        <Upload size={28} className="mb-3 text-zinc-400" />
                        <span className="font-medium text-sm text-zinc-700">
                          Upload primary image
                        </span>
                        <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadData.name}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, name: e.target.value })
                      }
                      placeholder="e.g. Classic Oxford Shirt"
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Category
                    </label>
                    <select
                      value={uploadData.category}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={uploadData.price}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, price: e.target.value })
                      }
                      placeholder="2999"
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Initial Inventory
                    </label>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadSuccess}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    {uploadSuccess ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-400" />{" "}
                        Saved
                      </>
                    ) : (
                      "Publish Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && !selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto pb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Notifications
              </h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                Mark all as read
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 1,
                  product: "Royal Sherwani Set",
                  user: "Rahul M.",
                  time: "2 hours ago",
                  message: "Is this available in size XL by next week?",
                  type: "inquiry",
                  unread: true,
                },
                {
                  id: 2,
                  product: "Midnight Silk Kurta",
                  user: "Ankit S.",
                  time: "5 hours ago",
                  message:
                    "Requested a try-on styling suggestion for a wedding event.",
                  type: "tryon",
                  unread: true,
                },
                {
                  id: 3,
                  product: "Rider Denim Jacket",
                  user: "Vikram K.",
                  time: "1 day ago",
                  message: "Can I get this customized with back embroidery?",
                  type: "inquiry",
                  unread: true,
                },
                {
                  id: 4,
                  product: "Classic White Tee",
                  user: "System",
                  time: "2 days ago",
                  message:
                    'Your item was featured in the "Minimalist Summer" trending collection.',
                  type: "system",
                  unread: false,
                },
              ].map((note) => (
                <div
                  key={note.id}
                  className={`p-5 rounded-xl border transition-all hover:shadow-md ${note.unread ? "bg-white border-zinc-200 shadow-sm" : "bg-zinc-50/50 border-zinc-100"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg shrink-0 ${note.type === "system" ? "bg-zinc-100 text-zinc-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {note.type === "system" ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <MessageSquare size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-zinc-900 tracking-tight">
                          {note.user}{" "}
                          <span className="text-zinc-500 font-normal ml-1">
                            regarding {note.product}
                          </span>
                        </h4>
                        <span className="text-xs text-zinc-400 font-medium">
                          {note.time}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {note.message}
                      </p>

                      {note.type === "inquiry" && (
                        <button className="mt-4 text-xs font-semibold px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors">
                          Reply to Inquiry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function AlertTriangle({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
