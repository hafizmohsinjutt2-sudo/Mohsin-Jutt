import { useState, useEffect } from 'react';
import { 
  Leaf, 
  CloudSun, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Settings, 
  LayoutDashboard,
  Sprout,
  Activity,
  LogOut,
  Bell,
  Search,
  Camera,
  ChevronRight,
  Menu,
  X,
  Droplets,
  Zap,
  Info,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, loginWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

// --- Types ---
type View = 'dashboard' | 'scanner' | 'weather' | 'market' | 'chat' | 'calendar' | 'schemes' | 'admin';

// --- Components ---
const Sidebar = ({ currentView, setView, isMobileOpen, setIsMobileOpen }: { 
  currentView: View, 
  setView: (v: View) => void,
  isMobileOpen: boolean,
  setIsMobileOpen: (o: boolean) => void
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'scanner', icon: Camera, label: 'Disease Scan' },
    { id: 'weather', icon: CloudSun, label: 'Forecast' },
    { id: 'market', icon: TrendingUp, label: 'Market Prices' },
    { id: 'chat', icon: MessageSquare, label: 'AI Advisor' },
    { id: 'calendar', icon: Calendar, label: 'Agri-Calendar' },
    { id: 'schemes', icon: Info, label: 'Govt Schemes' },
  ];

  const adminItem = { id: 'admin', icon: Settings, label: 'Admin Panel' };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-natural-600 text-natural-50 border-r border-natural-500 transform transition-transform duration-300 lg:translate-x-0
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-natural-300 rounded-xl shadow-lg shadow-natural-300/10">
            <Sprout className="text-natural-600 w-6 h-6" />
          </div>
          <span className="text-xl font-heading font-bold text-natural-50">AgroSmart <span className="text-natural-300">AI</span></span>
        </div>

        <nav className="space-y-1 overflow-y-auto flex-1 scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id as View); setIsMobileOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-natural-500 text-white shadow-sm' 
                    : 'text-natural-300/70 hover:bg-natural-500/50 hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-natural-300' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-natural-500/50">
             <button
                onClick={() => { setView('admin'); setIsMobileOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${currentView === 'admin'
                    ? 'bg-natural-400 text-white shadow-sm' 
                    : 'text-natural-300/70 hover:bg-natural-400/50 hover:text-white'}
                `}
              >
                <Settings className={`w-5 h-5 ${currentView === 'admin' ? 'text-white' : ''}`} />
                Admin Panel
                {currentView === 'admin' && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
          </div>
        </nav>

        <div className="mt-6 p-4 bg-natural-500/30 rounded-xl border border-white/5">
          <p className="text-[10px] text-natural-300 uppercase font-black mb-2 tracking-wider">Satellite Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-xs text-natural-50">NDVI Scan Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Simple check for admin - in a real app check custom claims or a profile doc
        // For this demo, let's allow the primary user to see admin panel
        setIsAdmin(true); 
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-natural-50">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-natural-600"
      >
        <Sprout size={48} />
      </motion.div>
    </div>
  );

  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-natural-50">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isMobileOpen={isSidebarOpen} 
        setIsMobileOpen={setIsSidebarOpen} 
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-natural-200">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 lg:hidden text-natural-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-natural-400 font-medium lowercase italic">Good morning, {user.displayName?.split(' ')[0]}</p>
            <h1 className="text-lg font-bold text-natural-600">
              {view === 'dashboard' && 'Punjab Central Farm • Block 4B'}
              {view === 'scanner' && 'Plant Symptom Analysis'}
              {view === 'weather' && 'Weather & Sowing Advice'}
              {view === 'market' && 'Market Price Insights'}
              {view === 'chat' && 'AI Expert Consult'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-natural-100 rounded-full px-4 py-1.5 flex items-center gap-2 border border-natural-200 hidden md:flex cursor-pointer hover:bg-natural-200 transition-all">
              <span className="text-xs font-bold text-natural-500 uppercase tracking-tight">Urdu / EN</span>
            </div>
            <button className="p-2 text-natural-400 hover:text-natural-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-natural-100">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-natural-300 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <Dashboard user={user} setView={setView} />}
              {view === 'scanner' && <DiseaseScanner />}
              {view === 'chat' && <AIChatView user={user} />}
              {view === 'market' && <MarketPriceView />}
              {view === 'weather' && <WeatherView />}
              {view === 'calendar' && <CalendarView />}
              {view === 'schemes' && <SchemesView />}
              {view === 'admin' && <AdminView user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Sub-views ---

function LandingPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-50 text-natural-700 overflow-hidden relative font-sans">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-natural-300/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-natural-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-natural-600 rounded-xl shadow-lg">
              <Sprout className="text-natural-50 w-6 h-6" />
            </div>
            <span className="text-2xl font-heading font-black text-natural-600 tracking-tight italic uppercase">AgroSmart AI</span>
          </div>
        </header>

        <main className="grid lg:grid-cols-2 gap-12 items-center flex-1">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-natural-600 text-natural-50 text-xs font-black uppercase tracking-widest rounded-full mb-6 italic">
                Sustainable Tech for Soil & Soul
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-natural-600 leading-tight mb-6 font-heading">
                Revolutionize Your <span className="text-natural-400">Farm</span> with AI.
              </h1>
              <p className="text-natural-500 text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium italic opacity-80">
                Empower your crops with real-time AI disease detection, hyperlocal weather forecasts, and predictive market analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={`
                    px-8 py-4 bg-natural-600 text-white rounded-2xl font-bold hover:bg-natural-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95
                    ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5 text-natural-300" />
                    </motion.div>
                  ) : (
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" alt=""/>
                  )}
                  {isLoggingIn ? 'Authenticating...' : 'Continue with Google'}
                </button>
                <button className="px-8 py-4 bg-white text-natural-600 rounded-2xl font-bold hover:bg-natural-100 transition-all flex items-center justify-center gap-3 border border-natural-200">
                  <Activity className="w-5 h-5 text-natural-300" />
                  Explore Demo
                </button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500 font-bold italic animate-pulse">
                   ⚠️ {error}
                </p>
              )}
            </motion.div>
          </div>

          <div className="hidden lg:block relative">
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="relative z-10 p-8 bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50"
             >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-natural-600 p-6 rounded-3xl border border-white/10 text-white shadow-lg shadow-natural-600/20">
                    <Activity className="text-natural-300 mb-3" />
                    <p className="text-2xl font-bold">98.4%</p>
                    <p className="text-xs text-natural-50/70 opacity-70">Diagnosis Accuracy</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-natural-100 shadow-sm text-natural-600">
                    <Droplets className="text-natural-300 mb-3" />
                    <p className="text-2xl font-bold">+15%</p>
                    <p className="text-xs text-natural-400">Yield Increase</p>
                  </div>
                  <div className="col-span-2 bg-natural-100 p-6 rounded-3xl border border-natural-200 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                       <p className="text-natural-600 font-bold uppercase text-xs tracking-wider">NDVI Vegetation Scan</p>
                       <span className="text-emerald-600 text-[10px] flex items-center gap-1 font-black italic">
                         <Activity size={12} /> LIVE MAP
                       </span>
                    </div>
                    <div className="h-24 flex items-end gap-2 relative z-10">
                       {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                         <div key={i} className={`flex-1 rounded-t-lg transition-all ${h > 60 ? 'bg-natural-300' : 'bg-natural-500'}`} style={{ height: `${h}%` }}></div>
                       ))}
                    </div>
                    {/* Mock satellite lines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                       <div className="absolute top-0 left-0 w-full h-[1px] bg-natural-600"></div>
                       <div className="absolute top-0 left-0 w-[1px] h-full bg-natural-600"></div>
                    </div>
                  </div>
                </div>
             </motion.div>
          </div>
        </main>

        <footer className="py-8 border-t border-natural-200 mt-12 flex flex-col sm:flex-row gap-6 items-center justify-between text-natural-400 text-[10px] font-black uppercase tracking-widest italic">
          <p>© 2026 AgroSmart AI Ecosystem • Empowering Soil & Soul</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-natural-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-natural-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-natural-600 transition-colors">Help</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Dashboard({ user, setView }: { user: any, setView: (v: View) => void }) {
  const [landscapeData, setLandscapeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landscape-updates')
      .then(res => res.json())
      .then(data => {
        setLandscapeData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Crop Health', value: 'Monitoring...', icon: Activity, detail: 'AI Active', color: 'text-natural-600' },
    { label: 'Soil Moisture', value: 'Awaiting Scan', icon: Droplets, detail: 'Sensor Link', color: 'text-blue-600' },
    { label: 'Risk Alert', value: 'Zero Risk', icon: Zap, detail: 'Clean Scan', color: 'text-amber-600' },
    { label: 'Yield Est.', value: 'Calculating...', icon: TrendingUp, detail: 'Data Link', color: 'text-natural-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-natural-200 shadow-sm transition-all hover:border-natural-300">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-2.5 rounded-xl ${stat.color.replace('text', 'bg')}/10 ${stat.color}`}>
                   <Icon size={24} />
                 </div>
                 <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded italic uppercase tracking-tighter">Live</span>
              </div>
              <p className="text-natural-400 text-[10px] font-black uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather & NDVI */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             {/* Localized Weather */}
             <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-natural-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-natural-600">Weather Forecast</h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded italic">LIVE</span>
                </div>
                {landscapeData?.weather ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-light text-natural-600">{landscapeData.weather.temp}°°</div>
                      <div className="text-xs text-natural-400 font-medium">
                        <p className="font-black uppercase text-natural-600">{landscapeData.weather.condition}</p>
                        <p>Precipitation: 12%</p>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-natural-100 pt-4">
                       {[
                         { d: 'Mon', t: '31' }, { d: 'Tue', t: '29' }, { d: 'Wed', t: '33' }, { d: 'Thu', t: '38', hot: true }
                       ].map((item, i) => (
                         <div key={i} className="text-center">
                            <p className="text-[10px] text-natural-400 font-bold uppercase">{item.d}</p>
                            <p className={`font-bold ${item.hot ? 'text-red-500' : 'text-natural-600'}`}>{item.t}°</p>
                         </div>
                       ))}
                    </div>
                    <div className="bg-natural-50 rounded-xl p-3 border border-dashed border-natural-300">
                      <p className="text-[10px] italic text-natural-500 leading-relaxed">
                        <span className="font-black uppercase not-italic mr-1">AI Advice:</span> High evaporation expected on Thursday. Increase irrigation duration.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-12 w-24 bg-natural-100 rounded"></div>
                    <div className="h-24 bg-natural-100 rounded"></div>
                  </div>
                )}
             </div>

             {/* NDVI Analysis */}
             <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-natural-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-natural-600">Crop Vitality (NDVI)</h3>
                  <button onClick={() => setView('scanner')} className="text-xs font-black text-natural-500 hover:underline uppercase tracking-widest italic">Details →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="sm:col-span-2 relative bg-natural-100 rounded-xl h-40 overflow-hidden border border-natural-200 group">
                      {/* Interactive map visualization */}
                      <div className="absolute inset-0 bg-natural-300 opacity-20"></div>
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/40 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                         <div className="glass px-3 py-1.5 rounded-lg text-[9px] font-black italic shadow-xl border-white/50 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                           FIELD A-1: 0.82 (VIGOROUS)
                         </div>
                      </div>
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                        {[...Array(16)].map((_, i) => <div key={i} className="border border-natural-600"></div>)}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                         <p className="text-[10px] text-emerald-700 font-black uppercase tracking-tighter">Status</p>
                         <p className="text-xl font-bold text-emerald-600 italic">Robust</p>
                      </div>
                      <div className="p-3 bg-natural-100 rounded-xl border border-natural-200">
                         <p className="text-[10px] text-natural-600 font-black uppercase tracking-tighter">Anomalies</p>
                         <p className="text-xl font-bold text-natural-700 italic">2 Plots</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Market Pulse */}
             <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm">
                <h3 className="font-bold text-natural-600 mb-6 flex items-center gap-2 tracking-tight">
                  <TrendingUp size={16} className="text-natural-400" />
                  Market Pulse
                </h3>
                <div className="space-y-4">
                  {landscapeData?.marketPrices?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-natural-100 rounded-lg flex items-center justify-center font-black text-natural-600 group-hover:bg-natural-600 group-hover:text-white transition-all italic">
                            {item.crop[0]}
                         </div>
                         <p className="text-sm font-bold text-natural-700">{item.crop}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-black text-natural-600 italic">Rs. {item.pricePerKg}/kg</p>
                         <p className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                           {item.trend === 'up' ? '↗ +2.4%' : '↘ -1.1%'}
                         </p>
                       </div>
                    </div>
                  )) || [1,2,3].map(i => <div key={i} className="h-10 bg-natural-50 rounded-xl animate-pulse"></div>)}
                </div>
             </div>

             {/* Quick Assistant */}
             <div className="bg-natural-600 p-6 rounded-2xl shadow-xl relative overflow-hidden text-white border border-natural-500">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <h3 className="font-bold mb-4 flex items-center gap-2 text-sm italic">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  AgroSmart Expert Advice
                </h3>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 mb-4">
                  <p className="text-xs italic text-natural-50 leading-relaxed font-medium">
                    \"Ahmad, I noticed yellowing on lower leaves of Wheat. Likely Nitrogen deficiency. Check soil moisture before fertilizing.\"
                  </p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setView('chat')}
                    className="flex-1 py-2 bg-white text-natural-600 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-lg active:scale-95"
                   >
                     Talk to AI
                   </button>
                   <button 
                    onClick={() => setView('scanner')}
                    className="py-2 px-3 bg-natural-500/50 border border-white/10 text-white rounded-lg text-[10px] font-bold italic"
                   >
                     Scan Photo
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm relative group overflow-hidden">
              <h3 className="font-bold text-natural-600 mb-6">Smart Irrigation</h3>
              <div className="flex flex-col items-center justify-center p-4">
                 <div className="relative w-40 h-40 rounded-full border-[10px] border-natural-100 flex items-center justify-center">
                    {/* SVG Progress Circle would be better here for the specific UI look */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-natural-600" strokeDasharray="440" strokeDashoffset="140" style={{ transform: 'scale(1.1)', transformOrigin: 'center' }} />
                    </svg>
                    <div className="text-center relative z-10">
                      <p className="text-3xl font-black text-natural-600 italic">64%</p>
                      <p className="text-[10px] text-natural-400 font-bold uppercase tracking-widest">Soil Moisture</p>
                    </div>
                 </div>
                 <button className="mt-8 w-full py-3 bg-natural-600 text-natural-50 rounded-xl text-xs font-black uppercase tracking-widest italic shadow-lg shadow-natural-600/20 active:scale-95 transition-all">
                   Activate Drip Pulse
                 </button>
              </div>
              <div className="absolute -bottom-1 -right-1 opacity-10 font-black text-6xl text-natural-600 pointer-events-none italic">H2O</div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm">
              <h3 className="font-bold text-natural-600 mb-4 tracking-tighter">Quick Operations</h3>
              <div className="space-y-2">
                 {[
                   { t: 'Optimize Fertilizer', emoji: '💊', color: 'bg-natural-50 text-natural-600' },
                   { t: 'Gov Schemes', emoji: '🏛️', color: 'bg-natural-100 text-natural-500' },
                   { t: 'Pest Prediction', emoji: '🦋', color: 'bg-amber-50 text-amber-600' },
                   { t: 'Data Export', emoji: '📊', color: 'bg-blue-50 text-blue-600' },
                 ].map((op, i) => (
                   <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-natural-200 transition-all font-bold text-xs uppercase tracking-tight text-natural-700 italic group`}>
                      <span className={`p-2 rounded-lg ${op.color} group-hover:scale-110 transition-transform`}>{op.emoji}</span>
                      {op.t}
                   </button>
                 ))}
              </div>
           </div>

           {/* Emergency Alert Area */}
           <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mt-1 shrink-0"></div>
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">Alert: Pest Warning</p>
                <p className="text-xs text-red-700 font-medium leading-tight mt-1">
                  Local Locust swarm predicted 30km North. Recommend preventive sprays.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DiseaseScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    processImage(file);
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const base64 = await toBase64(file);
      const res = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64.split(',')[1] })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result as string);
    reader.onerror = error => rej(error);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm relative overflow-hidden group">
         <div className="absolute -top-24 -right-24 w-48 h-48 bg-natural-100 rounded-full blur-3xl opacity-50"></div>
         {!result && !loading && (
           <div className="text-center py-12 relative z-10">
             <div className="mb-6 inline-block p-4 bg-natural-100 rounded-full border border-natural-200">
               <Camera className="w-12 h-12 text-natural-600" />
             </div>
             <h2 className="text-3xl font-bold mb-4 font-heading text-natural-700">Plant Pathogen Diagnosis</h2>
             <p className="text-natural-400 mb-8 max-w-md mx-auto italic font-medium leading-relaxed">
               Capture or upload leaf patterns for real-time symptom analysis and organic intervention advice.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label className="px-8 py-4 bg-natural-600 text-white rounded-2xl font-black uppercase tracking-widest italic cursor-pointer hover:bg-natural-700 shadow-xl active:scale-95 transition-all">
                  Upload Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
                <button 
                  onClick={() => setCameraOpen(true)}
                  className="px-8 py-4 bg-natural-100 text-natural-600 rounded-2xl font-black uppercase tracking-widest italic hover:bg-natural-200 shadow-sm border border-natural-200"
                >
                  Open Camera
                </button>
             </div>
             <p className="mt-8 text-[10px] text-natural-300 font-bold uppercase tracking-widest">Dataset: South Asian Crop Pathogens v4.2</p>
           </div>
         )}

         {loading && (
           <div className="py-24 text-center">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="inline-block p-4 bg-natural-50 rounded-full mb-6"
             >
               <Activity className="w-12 h-12 text-natural-600" />
             </motion.div>
             <h3 className="text-xl font-bold">Analyzing Symptoms...</h3>
             <p className="text-natural-400 mt-2">Comparing against 50,000+ disease patterns</p>
           </div>
         )}

         {result && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Result Header */}
               <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-natural-100 text-natural-600 text-xs font-bold rounded-full">{result.crop}</span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      result.severity === 'High' ? 'bg-red-50 text-red-700' : 
                      result.severity === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>Severity: {result.severity}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 font-heading text-natural-600">{result.disease}</h2>
                  <p className="text-natural-400 text-lg flex items-center gap-2">
                    <Activity size={18} className="text-natural-300" />
                    AI Confidence: {result.confidence}%
                  </p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-natural-50 p-6 rounded-2xl border border-natural-100">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-natural-700">
                        <Droplets size={18} className="text-blue-500" /> Treatments
                      </h4>
                      <ul className="space-y-2">
                        {result.treatments.map((t: string, i: number) => (
                          <li key={i} className="text-sm text-natural-600 flex items-start gap-2 italic">
                            <span className="text-blue-500 font-bold">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-emerald-800">
                        <Leaf size={18} className="text-emerald-500" /> Organic Options
                      </h4>
                      <ul className="space-y-2">
                        {result.organicAlternatives.map((t: string, i: number) => (
                          <li key={i} className="text-sm text-emerald-800 flex items-start gap-2 italic">
                            <span className="text-emerald-500 font-bold">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => setResult(null)}
                    className="mt-8 w-full py-4 bg-natural-600 text-white rounded-2xl font-bold hover:bg-natural-700 transition-all flex items-center justify-center gap-3"
                  >
                    Scan Another Plant
                  </button>
               </div>
               
               <div className="w-full md:w-72 aspect-square rounded-3xl bg-natural-100 overflow-hidden border-4 border-white shadow-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <img src="https://images.unsplash.com/photo-1597103403300-8b1e4e6f4770?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Plant Leaf"/>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-[10px] opacity-70 uppercase font-black">AI Segmentation</p>
                    <p className="font-bold">Detected Areas</p>
                  </div>
               </div>
             </div>
           </div>
         )}
       </div>

       {/* Camera simulate modal */}
       {cameraOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-natural-700/90 p-6 backdrop-blur-sm">
           <div className="w-full max-w-sm aspect-[9/16] bg-natural-600 rounded-[40px] border-8 border-natural-500 relative overflow-hidden shadow-2xl">
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-natural-500 rounded-full"></div>
             <button onClick={() => setCameraOpen(false)} className="absolute top-4 right-4 p-2 text-natural-300 hover:text-white transition-colors"><X size={24}/></button>
             
             <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
               <Camera size={64} className="mb-4 text-natural-300 animate-pulse" />
               <p className="text-lg font-bold font-heading">Camera Interlink</p>
               <p className="text-sm text-natural-200 mb-12 italic">Target leaf patterns for analysis</p>
               
               <button 
                  onClick={() => {
                    setCameraOpen(false);
                    // In a real app we'd capture frame, here we mock it
                    setLoading(true);
                    setTimeout(() => {
                      setResult({
                        crop: "Tomato",
                        disease: "Early Blight (Alternaria Solani)",
                        confidence: 94.2,
                        severity: "Medium",
                        treatments: ["Apply copper-based fungicides", "Prune infected lower leaves", "Improve air circulation"],
                        organicAlternatives: ["Spray Neem Oil solution", "Use Baking Soda and Liquid Soap spray", "Mulch with straw to prevent soil splash"]
                      });
                      setLoading(false);
                    }, 2000);
                  }}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-all shadow-xl"
               >
                 <div className="w-12 h-12 bg-white rounded-full"></div>
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

function AIChatView({ user }: { user: any }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello ${user?.displayName?.split(' ')[0] || 'Farmer'}! I'm your AgroSmart AI Assistant. How can I help you today? You can ask me about crops, weather, or pest control.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white rounded-[40px] border border-natural-200 overflow-hidden shadow-2xl">
       <div className="p-5 border-b border-natural-100 flex items-center justify-between bg-natural-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight italic">Expert AI Assistant</h3>
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest italic leading-none mt-0.5 animate-pulse">● Online & Ready</p>
            </div>
          </div>
          <div className="flex -space-x-2">
             {[1,2].map(i => <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} className="w-8 h-8 rounded-full border-2 border-natural-600" />)}
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-natural-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl italic font-medium shadow-sm border ${
                m.role === 'user' 
                  ? 'bg-natural-600 text-white rounded-tr-none border-natural-500' 
                  : 'bg-white text-natural-700 rounded-tl-none border-natural-100'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-natural-100 flex gap-1 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-natural-300 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-natural-300 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1.5 h-1.5 bg-natural-300 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          )}
       </div>

       <div className="p-5 bg-white border-t border-natural-100">
          <div className="flex gap-3">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Query the field knowledge base..."
              className="flex-1 p-4 bg-natural-100 border border-natural-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-natural-600/10 italic font-medium"
            />
            <button 
              onClick={send}
              className="p-4 bg-natural-600 text-white rounded-2xl hover:bg-natural-700 transition-all shadow-xl active:scale-95"
            >
              <ChevronRight />
            </button>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-1 text-[9px] font-black uppercase italic tracking-widest text-natural-400 whitespace-nowrap scrollbar-hide px-1">
             <button onClick={() => setInput('Wheat sowing advice for Punjab?')} className="hover:text-natural-600 transition-colors">Punjab Sowing Window</button>
             <button onClick={() => setInput('Organic pest control for citrus?')} className="hover:text-natural-600 transition-colors">Citrus Pest Stewardship</button>
             <button onClick={() => setInput('Soil moisture threshold?')} className="hover:text-natural-600 transition-colors">Moisture Thresholds</button>
          </div>
       </div>
    </div>
  );
}

function AdminView({ user }: { user: FirebaseUser }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
             <div>
                <h2 className="text-2xl font-bold text-natural-600 font-heading tracking-tight underline decoration-natural-300 decoration-4 underline-offset-8">Admin Panel</h2>
                <p className="text-sm text-natural-400 mt-4 italic">Operator: {user.email}</p>
             </div>
             <button 
              onClick={() => signOut(auth)}
              className="px-6 py-2 bg-natural-100 text-natural-600 border border-natural-200 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-natural-600 hover:text-white transition-all font-sans"
             >
               Sign Out
             </button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
             <div className="p-6 bg-natural-50 rounded-full border border-natural-100 mb-6">
                <Settings size={48} className="text-natural-300 animate-spin-slow" />
             </div>
             <h3 className="text-xl font-bold text-natural-600 mb-2">Systems Ready</h3>
             <p className="text-sm text-natural-400 max-w-sm mx-auto italic font-medium">
               The administrative environment has been initialized and cleared of all test data. Real-time metrics will populate as nodes connect.
             </p>
          </div>
          
          <div className="mt-8 p-6 bg-natural-50 rounded-2xl border border-natural-200 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest italic text-emerald-600">Auth Verified</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest italic text-blue-600">Storage Ready</span>
                </div>
             </div>
             <p className="text-[10px] font-black text-natural-300 uppercase tracking-widest italic">v0.1.0-alpha</p>
          </div>
       </div>
    </div>
  );
}

function MarketPriceView() {
  return <Placeholder icon={TrendingUp} title="Market Trends" desc="Explore live mandi prices and predictive demand analytics across 500+ regional markets." />;
}

function WeatherView() {
  return <Placeholder icon={CloudSun} title="Weather Forecast" desc="Hyperlocal precipitation mapping and crop-specific sowing recommendations powered by NASA data." />;
}

function CalendarView() {
  return <Placeholder icon={Calendar} title="Agri-Calendar" desc="Automatically generated seasonal workflow based on your crop selections and local environment." />;
}

function SchemesView() {
  return <Placeholder icon={Info} title="Govt Schemes" desc="Personalized notifications for agriculture subsidies, loan programs, and insurance eligibility checks." />;
}

function Placeholder({ icon: Icon, title, desc }: any) {
  return (
    <div className="max-w-xl mx-auto py-24 text-center">
       <div className="inline-block p-6 bg-natural-100 rounded-[32px] mb-8 text-natural-600 border border-natural-200 shadow-sm transition-transform hover:scale-105">
         <Icon size={48} />
       </div>
       <h2 className="text-3xl font-bold mb-4 font-heading text-natural-700">{title}</h2>
       <p className="text-natural-500 text-lg leading-relaxed italic font-medium opacity-80">{desc}</p>
       <button className="mt-8 px-8 py-3 bg-natural-600 text-white rounded-xl font-black uppercase tracking-widest italic shadow-xl hover:bg-natural-700 transition-all active:scale-95">
         Notify Me When Ready
       </button>
    </div>
  );
}
