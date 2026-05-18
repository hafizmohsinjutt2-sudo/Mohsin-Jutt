import { useState, useEffect, useRef } from 'react';
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
  Calendar,
  LineChart as LineChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { auth, loginWithGoogle, loginAnonymously } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

// --- Types ---
type View = 'dashboard' | 'scanner' | 'weather' | 'market' | 'chat' | 'calendar' | 'schemes' | 'admin' | 'market-intel';
type Language = 'en' | 'ur';

const translations = {
  en: {
    overview: "Overview",
    diseaseScan: "Disease Scan",
    forecast: "Forecast",
    marketPrices: "Market Prices",
    marketIntel: "Market Intelligence",
    aiAdvisor: "AI Advisor",
    agriCalendar: "Agri-Calendar",
    govtSchemes: "Govt Schemes",
    adminPanel: "Admin Panel",
    greeting: "Good morning",
    satelliteStatus: "Satellite Status",
    activeUser: "Active User",
    signOut: "Sign Out",
    notifTitle: "Notifications",
    satelliteActive: "NDVI Scan Active",
    punjabFarm: "Punjab Central Farm • Block 4B",
    scanTitle: "Plant Symptom Analysis",
    weatherTitle: "Weather & Sowing Advice",
    marketTitle: "Market Price Insights",
    marketIntelTitle: "Pakistan Smart Market Intelligence",
    chatTitle: "AI Expert Consult",
    weatherForecast: "Weather Forecast",
    cropVitality: "Crop Vitality (NDVI)",
    marketPulse: "Market Pulse",
    expertAdvice: "AgroSmart Expert Advice",
    talkToAi: "Talk to AI",
    scanPhoto: "Scan Photo",
    smartIrrigation: "Smart Irrigation",
    soilMoisture: "Soil Moisture",
    activateDrip: "Activate Drip Pulse",
    quickOps: "Quick Operations",
    pestWarning: "Alert: Pest Warning",
    locustAlert: "Local Locust swarm predicted 30km North. Recommend preventive sprays.",
    details: "Details",
    live: "LIVE",
    robust: "Robust",
    anomalies: "Anomalies",
    plots: "Plots",
    optimizeFertilizer: "Optimize Fertilizer",
    pestPrediction: "Pest Prediction",
    dataExport: "Data Export",
    bestSellTime: "Best Time to Sell",
    holdStrong: "Hold Strong",
    priceTrend: "Price Trend",
    mandiRates: "Mandi Rates",
    cityMandi: "City-wise Mandi Rates",
    aiForecast: "AI Price Forecasting (30 Days)",
    agriSupplies: "Agri Supplies",
    pesticides: "Pesticides",
    fertilizers: "Fertilizers",
    seeds: "Seeds",
    demand: "Demand",
    mandiAlert: "Mandi Alert",
    recommendation: "Recommendation",
    aiMarketInsights: "AI Market Insights",
    bestSellingWindow: "Best Selling Window",
    sellAdvice: "Prices are expected to peak due to a temporary supply shortage. High export demand detected.",
    scanAnother: "Scan Another Plant",
    analyzingSymptoms: "Analyzing Symptoms...",
    comparingPatterns: "Comparing against 50,000+ disease patterns",
    detectedAreas: "Detected Areas",
    currentRate: "Current Rate",
    aiPredicted30d: "30d AI Predicted",
    severity: "Severity",
    aiConfidence: "AI Confidence"
  },
  ur: {
    overview: "جائزہ",
    diseaseScan: "بیماری کی تشخیص",
    forecast: "موسم کی پیش گوئی",
    marketPrices: "مارکیٹ کی قیمتیں",
    marketIntel: "مارکیٹ انٹیلیجنس",
    aiAdvisor: "اے آئی مشیر",
    agriCalendar: "زرعی کیلنڈر",
    govtSchemes: "سرکاری سکیمیں",
    adminPanel: "ایڈمن پینل",
    greeting: "صبح بخیر",
    satelliteStatus: "سیٹلائٹ کی صورتحال",
    activeUser: "فعال صارف",
    signOut: "لاگ آؤٹ",
    notifTitle: "اطلاعات",
    satelliteActive: "این ڈی وی آئی اسکین فعال",
    punjabFarm: "پنجاب سینٹرل فارم • بلاک 4B",
    scanTitle: "پودوں کی علامات کا تجزیہ",
    weatherTitle: "موسم اور بوائی کا مشورہ",
    marketTitle: "مارکیٹ کی قیمتوں کی معلومات",
    marketIntelTitle: "پاکستان اسمارٹ مارکیٹ انٹیلیجنس",
    chatTitle: "اے آئی ماہر سے مشورہ",
    weatherForecast: "موسم کی پیش گوئی",
    cropVitality: "فصل کی حیات (این ڈی وی آئی)",
    marketPulse: "مارکیٹ پلس",
    expertAdvice: "ایگرو اسمارٹ ماہر کا مشورہ",
    talkToAi: "اے آئی سے بات کریں",
    scanPhoto: "فوٹو اسکین کریں",
    smartIrrigation: "سمارٹ آبپاشی",
    soilMoisture: "مٹی کی نمی",
    activateDrip: "ڈرپ پلس کو چالو کریں",
    quickOps: "فوری آپریشنز",
    pestWarning: "انتباہ: کیڑوں کی وارننگ",
    locustAlert: "وارننگ: ٹڈی دل کی نقل مکانی رپورٹ ہوئی ہے۔ تدارک کے لیے اسپرے شروع کریں۔",
    details: "تفصیلات",
    live: "براہ راست",
    robust: "مضبوط",
    anomalies: "بے ضابطگییاں",
    plots: "پلاٹ",
    optimizeFertilizer: "کھاد کو بہتر بنائیں",
    pestPrediction: "کیڑوں کی پیش گوئی",
    dataExport: "ڈیٹا ایکسپورٹ",
    bestSellTime: "فروخت کرنے کا بہترین وقت",
    holdStrong: "ہولڈ کریں",
    priceTrend: "قیمت کا رجحان",
    mandiRates: "منڈی کے نرخ",
    cityMandi: "شہر کے لحاظ سے منڈی کے نرخ",
    aiForecast: "اے آئی قیمت کی پیشن گوئی (30 دن)",
    agriSupplies: "زرعی سامان",
    pesticides: "کیڑے مار ادویات",
    fertilizers: "کھادیں",
    seeds: "بیج",
    demand: "طلب",
    mandiAlert: "منڈی الرٹ",
    recommendation: "سفارش",
    aiMarketInsights: "اے آئی مارکیٹ بصیرت",
    bestSellingWindow: "فروخت کے لیے بہترین وقت",
    sellAdvice: "عارضی سپلائی کی کمی کی وجہ سے قیمتیں بڑھنے کی توقع ہے۔ برآمدات کی زیادہ طلب دیکھی گئی۔",
    scanAnother: "ایک اور پودے کو اسکین کریں",
    analyzingSymptoms: "علامات کا تجزیہ کیا جا رہا ہے...",
    comparingPatterns: "50,000 سے زیادہ بیماریوں کے نمونوں کے ساتھ موازنہ",
    detectedAreas: "نشاندہی شدہ علاقے",
    currentRate: "موجودہ ریٹ",
    aiPredicted30d: "30 دن کی پیش گوئی",
    severity: "شدت",
    aiConfidence: "اے آئی اعتماد"
  }
};

// --- Components ---
const Sidebar = ({ currentView, setView, isMobileOpen, setIsMobileOpen, language }: { 
  currentView: View, 
  setView: (v: View) => void,
  isMobileOpen: boolean,
  setIsMobileOpen: (o: boolean) => void,
  language: Language
}) => {
  const t = translations[language];
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.overview },
    { id: 'scanner', icon: Camera, label: t.diseaseScan },
    { id: 'weather', icon: CloudSun, label: t.forecast },
    { id: 'market-intel', icon: TrendingUp, label: t.marketIntel },
    { id: 'chat', icon: MessageSquare, label: t.aiAdvisor },
    { id: 'calendar', icon: Calendar, label: t.agriCalendar },
    { id: 'schemes', icon: Info, label: t.govtSchemes },
  ];

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
                {t.adminPanel}
                {currentView === 'admin' && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
          </div>
        </nav>

        <div className="mt-6 p-4 bg-natural-500/30 rounded-xl border border-white/5">
          <p className="text-[10px] text-natural-300 uppercase font-black mb-2 tracking-wider">{t.satelliteStatus}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-xs text-natural-50">{t.satelliteActive}</p>
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
  const [language, setLanguage] = useState<Language>('en');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
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

  if (!user) return <LandingPage setUser={setUser} setIsAdmin={setIsAdmin} />;

  return (
    <div className="min-h-screen bg-natural-50" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isMobileOpen={isSidebarOpen} 
        setIsMobileOpen={setIsSidebarOpen} 
        language={language}
      />

      {/* Main Content */}
      <main className={`min-h-screen ${language === 'en' ? 'lg:ml-64' : 'lg:mr-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-natural-200">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 lg:hidden text-natural-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-natural-400 font-medium lowercase italic">{t.greeting}, {user.displayName?.split(' ')[0]}</p>
            <h1 className="text-lg font-bold text-natural-600">
              {view === 'dashboard' && t.punjabFarm}
              {view === 'scanner' && t.scanTitle}
              {view === 'weather' && t.weatherTitle}
              {view === 'market' && t.marketTitle}
              {view === 'chat' && t.chatTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'ur' : 'en')}
              className="bg-natural-100 rounded-full px-4 py-1.5 flex items-center gap-2 border border-natural-200 hidden md:flex cursor-pointer hover:bg-natural-200 transition-all"
            >
              <span className="text-xs font-bold text-natural-500 uppercase tracking-tight">Urdu / EN</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-natural-400 hover:text-natural-600 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-12 ${language === 'en' ? 'right-0' : 'left-0'} w-64 bg-white border border-natural-200 rounded-2xl shadow-xl p-4 z-50`}
                  >
                    <h4 className="text-xs font-black uppercase tracking-widest text-natural-600 mb-4">{t.notifTitle}</h4>
                    <div className="space-y-4">
                       <div className="flex gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0"></div>
                          <p className="text-natural-600 leading-relaxed font-medium">Local Locust swarm predicted 30km North. Prevent!</p>
                       </div>
                       <div className="flex gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                          <p className="text-natural-600 leading-relaxed font-medium">New subsidy scheme for Solar Pumps live.</p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
               <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-4 border-l border-natural-100"
               >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-natural-300 shadow-sm"
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`absolute top-12 ${language === 'en' ? 'right-0' : 'left-0'} w-48 bg-white border border-natural-200 rounded-2xl shadow-xl p-4 z-50`}
                  >
                    <div className="text-center mb-4 pb-4 border-b border-natural-100">
                       <p className="text-sm font-bold text-natural-700">{user.displayName || 'Farmer'}</p>
                       <p className="text-[10px] text-natural-400 font-medium italic">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => signOut(auth)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase text-red-500 hover:bg-red-50 rounded-lg transition-all tracking-widest"
                    >
                      <LogOut size={14} />
                      {t.signOut}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
              {view === 'dashboard' && <Dashboard user={user} setView={setView} language={language} />}
              {view === 'scanner' && <DiseaseScanner language={language} />}
              {view === 'chat' && <AIChatView user={user} language={language} />}
              {view === 'market' && <MarketPriceView language={language} />}
              {view === 'market-intel' && <MarketIntelligenceView language={language} />}
              {view === 'weather' && <WeatherView language={language} />}
              {view === 'calendar' && <CalendarView language={language} />}
              {view === 'schemes' && <SchemesView language={language} />}
              {view === 'admin' && <AdminView user={user} language={language} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Sub-views ---

function LandingPage({ setUser, setIsAdmin }: { setUser: (u: any) => void, setIsAdmin: (a: boolean) => void }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = {
    en: {
      hero: "Revolutionize Your Farm with AI.",
      desc: "Empower your crops with real-time AI disease detection, hyperlocal weather forecasts, and predictive market analytics.",
      google: "Continue with Google",
      demo: "Explore Demo",
      accuracy: "Diagnosis Accuracy",
      yield: "Yield Increase",
      ndvi: "NDVI Vegetation Scan",
      live: "LIVE MAP",
      footer: "© 2026 AgroSmart AI Ecosystem • Empowering Soil & Soul",
      privacy: "Privacy",
      terms: "Terms",
      help: "Help",
      lang: "اردو",
      authenticating: "Authenticating...",
      loadingDemo: "Loading Demo..."
    },
    ur: {
      hero: "اے آئی کے ساتھ اپنے فارم میں انقلاب لائیں۔",
      desc: "ریئل ٹائم اے آئی بیماریوں کا پتہ لگانے، ہائپر لوکل موسم کی پیش گوئی، اور مارکیٹ کے تجزیات کے ساتھ اپنی فصلوں کو بااختیار بنائیں۔",
      google: "گوگل کے ساتھ جاری رکھیں",
      demo: "ڈیمو دیکھیں",
      accuracy: "تشخیص کی درستگی",
      yield: "پیداوار میں اضافہ",
      ndvi: "این ڈی وی آئی اسکین",
      live: "براہ راست نقشہ",
      footer: "© 2026 ایگرو اسمارٹ اے آئی ایکو سسٹم • مٹی اور روح کو بااختیار بنانا",
      privacy: "رازداری",
      terms: "شرائط",
      help: "مدد",
      lang: "English",
      authenticating: "تصدیق کی جا رہی ہے...",
      loadingDemo: "ڈیمو لوڈ ہو رہا ہے..."
    }
  }[language];

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginAnonymously();
    } catch (err: any) {
      console.warn("Firebase Anonymous Auth failed, falling back to Mock Demo Mode:", err.message);
      // Fallback to local mock state if anonymous auth is disabled in Firebase console
      const mockUser = {
        uid: 'demo-user-123',
        displayName: 'Demo Farmer',
        email: 'demo@agrosmart.ai',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+Farmer&background=random',
        isAnonymous: true
      } as FirebaseUser;
      
      setUser(mockUser);
      setIsAdmin(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-50 text-natural-700 overflow-hidden relative font-sans" dir={language === 'ur' ? 'rtl' : 'ltr'}>
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
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'ur' : 'en')}
            className="px-6 py-2 bg-white border border-natural-200 rounded-full text-xs font-black uppercase tracking-widest text-natural-600 hover:bg-natural-100 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {t.lang}
          </button>
        </header>

        <main className="grid lg:grid-cols-2 gap-12 items-center flex-1">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-natural-600 text-natural-50 text-xs font-black uppercase tracking-widest rounded-full mb-6 italic">
                {language === 'en' ? 'Sustainable Tech for Soil & Soul' : 'مٹی اور روح کے لیے پائیدار ٹیکنالوجی'}
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-natural-600 leading-tight mb-6 font-heading">
                {language === 'en' ? (
                  <>Revolutionize Your <span className="text-natural-400">Farm</span> with AI.</>
                ) : (
                  <>اے آئی کے ساتھ اپنے <span className="text-natural-400">فارم</span> میں انقلاب لائیں۔</>
                )}
              </h1>
              <p className="text-natural-500 text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium italic opacity-80">
                {t.desc}
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
                  {isLoggingIn ? t.authenticating : t.google}
                </button>
                <button 
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className={`
                    px-8 py-4 bg-white text-natural-600 rounded-2xl font-bold hover:bg-natural-100 transition-all flex items-center justify-center gap-3 border border-natural-200 shadow-sm
                    ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}
                  `}
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Activity className="w-5 h-5 text-natural-300" />
                    </motion.div>
                  ) : (
                    <Activity className="w-5 h-5 text-natural-300" />
                  )}
                  {isLoggingIn ? t.loadingDemo : t.demo}
                </button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500 font-bold italic animate-pulse">
                   ⚠️ {error}
                </p>
              )}
            </motion.div>
          </div>

          <div className={`hidden lg:block relative ${language === 'ur' ? 'lg:-translate-x-12' : 'lg:translate-x-12'}`}>
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="relative z-10 p-8 bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50"
             >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-natural-600 p-6 rounded-3xl border border-white/10 text-white shadow-lg shadow-natural-600/20">
                    <Activity className="text-natural-300 mb-3" />
                    <p className="text-2xl font-bold">98.4%</p>
                    <p className="text-xs text-natural-50/70 opacity-70">{t.accuracy}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-natural-100 shadow-sm text-natural-600">
                    <Droplets className="text-natural-300 mb-3" />
                    <p className="text-2xl font-bold">+15%</p>
                    <p className="text-xs text-natural-400">{t.yield}</p>
                  </div>
                  <div className="col-span-2 bg-natural-100 p-6 rounded-3xl border border-natural-200 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                       <p className="text-natural-600 font-bold uppercase text-xs tracking-wider">{t.ndvi}</p>
                       <span className="text-emerald-600 text-[10px] flex items-center gap-1 font-black italic">
                         <Activity size={12} /> {t.live}
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
          <p>{t.footer}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-natural-600 transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-natural-600 transition-colors">{t.terms}</a>
            <a href="#" className="hover:text-natural-600 transition-colors">{t.help}</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Dashboard({ user, setView, language }: { user: any, setView: (v: View) => void, language: Language }) {
  const [landscapeData, setLandscapeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

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
    { label: language === 'en' ? 'Current Temp' : 'موجودہ درجہ حرارت', value: landscapeData?.weather ? `${landscapeData.weather.temp}°C` : 'Fetching...', icon: CloudSun, detail: landscapeData?.weather?.condition || 'Weather Link', color: 'text-natural-600' },
    { label: language === 'en' ? 'Market Sentiment' : 'مارکیٹ کا رجحان', value: landscapeData?.marketPrices ? (landscapeData.marketPrices[0]?.trend === 'up' ? 'Bullish' : 'Stable') : 'Analyzing...', icon: TrendingUp, detail: landscapeData?.marketPrices?.[0]?.crop || 'Market Link', color: 'text-emerald-600' },
    { label: language === 'en' ? 'Risk Alert' : 'خطرے کا انتباہ', value: 'Zero Risk', icon: Zap, detail: 'Clean Scan', color: 'text-amber-600' },
    { label: language === 'en' ? 'Yield Est.' : 'پیداوار کا تخمینہ', value: 'Calculating...', icon: TrendingUp, detail: 'Data Link', color: 'text-natural-600' },
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
                  <h3 className="font-bold text-natural-600">{t.weatherForecast}</h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded italic">{t.live}</span>
                </div>
                {landscapeData?.weather ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-light text-natural-600">{landscapeData.weather.temp}°</div>
                      <div className="text-xs text-natural-400 font-medium">
                        <p className="font-black uppercase text-natural-600">{landscapeData.weather.condition}</p>
                        <p>{language === 'en' ? 'Precipitation' : 'بارش'}: 12%</p>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-natural-100 pt-4">
                       {[
                         { d: language === 'en' ? 'Mon' : 'پیر', t: '31' }, { d: language === 'en' ? 'Tue' : 'منگل', t: '29' }, { d: language === 'en' ? 'Wed' : 'بدھ', t: '33' }, { d: language === 'en' ? 'Thu' : 'جمعرات', t: '38', hot: true }
                       ].map((item, i) => (
                         <div key={i} className="text-center">
                            <p className="text-[10px] text-natural-400 font-bold uppercase">{item.d}</p>
                            <p className={`font-bold ${item.hot ? 'text-red-500' : 'text-natural-600'}`}>{item.t}°</p>
                         </div>
                       ))}
                    </div>
                    <div className="bg-natural-50 rounded-xl p-3 border border-dashed border-natural-300">
                      <p className="text-[10px] italic text-natural-500 leading-relaxed">
                        <span className="font-black uppercase not-italic mr-1">{language === 'en' ? 'AI Advice' : 'اے آئی مشورہ'}:</span> {language === 'en' ? 'High evaporation expected on Thursday. Increase irrigation duration.' : 'جمعرات کو زیادہ بخارات کی توقع ہے۔ آبپاشی کا دورانیہ بڑھائیں۔'}
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
             <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-natural-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Satellite" />
                </div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="font-bold text-natural-600">{t.cropVitality}</h3>
                  <button onClick={() => setView('scanner')} className="text-xs font-black text-natural-500 hover:underline uppercase tracking-widest italic">{t.details} →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                   <div className="sm:col-span-2 relative bg-natural-100 rounded-xl h-40 overflow-hidden border border-natural-200 group">
                      {/* Interactive map visualization */}
                      <img 
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" 
                        alt="Farm Map" 
                      />
                      <div className="absolute inset-0 bg-natural-300 opacity-20"></div>
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/40 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                         <div className="glass px-3 py-1.5 rounded-lg text-[9px] font-black italic shadow-xl border-white/50 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                           FIELD A-1: 0.82 ({t.robust.toUpperCase()})
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
                         <p className="text-xl font-bold text-emerald-600 italic">{t.robust}</p>
                      </div>
                      <div className="p-3 bg-natural-100 rounded-xl border border-natural-200">
                         <p className="text-[10px] text-natural-600 font-black uppercase tracking-tighter">{t.anomalies}</p>
                         <p className="text-xl font-bold text-natural-700 italic">2 {t.plots}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Market Pulse */}
             <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400" 
                  className="absolute bottom-0 right-0 w-24 h-24 object-cover opacity-5 grayscale pointer-events-none" 
                  alt="Crop info"
                />
                <h3 className="font-bold text-natural-600 mb-6 flex items-center gap-2 tracking-tight relative z-10">
                  <TrendingUp size={16} className="text-natural-400" />
                  {t.marketPulse}
                </h3>
                <div className="space-y-4 relative z-10">
                  {landscapeData?.marketPrices?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-natural-100 rounded-lg flex items-center justify-center font-black text-natural-600 group-hover:bg-natural-600 group-hover:text-white transition-all italic underline decoration-natural-300">
                            {item.crop[0]}
                         </div>
                         <p className="text-sm font-bold text-natural-700">{item.crop}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-black text-natural-600 italic">{item.price}</p>
                         <p className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                           {item.trend === 'up' ? '↗ Bullish' : item.trend === 'down' ? '↘ Bearish' : '→ Stable'}
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
                  {t.expertAdvice}
                </h3>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 mb-4">
                  <p className="text-xs italic text-natural-50 leading-relaxed font-medium">
                    {language === 'en' 
                      ? "\"Ahmad, I noticed yellowing on lower leaves of Wheat. Likely Nitrogen deficiency. Check soil moisture before fertilizing.\""
                      : "\"احمد، میں نے گندم کے نچلے پتوں پر زردی دیکھی ہے۔ غالبا نائٹروجن کی کمی ہے۔ کھاد ڈالنے سے پہلے مٹی کی نمی کو چیک کریں۔\""}
                  </p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setView('chat')}
                    className="flex-1 py-2 bg-white text-natural-600 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-lg active:scale-95 transition-all hover:bg-natural-100"
                   >
                     {t.talkToAi}
                   </button>
                   <button 
                    onClick={() => setView('scanner')}
                    className="py-2 px-3 bg-natural-500/50 border border-white/10 text-white rounded-lg text-[10px] font-bold italic hover:bg-natural-500 transition-all"
                   >
                     {t.scanPhoto}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm relative group overflow-hidden">
              <h3 className="font-bold text-natural-600 mb-6">{t.smartIrrigation}</h3>
              <div className="flex flex-col items-center justify-center p-4">
                 <div className="relative w-40 h-40 rounded-full border-[10px] border-natural-100 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-natural-600" strokeDasharray="440" strokeDashoffset="140" style={{ transform: 'scale(1.1)', transformOrigin: 'center' }} />
                    </svg>
                    <div className="text-center relative z-10 transition-transform group-hover:scale-110">
                      <p className="text-3xl font-black text-natural-600 italic">64%</p>
                      <p className="text-[10px] text-natural-400 font-bold uppercase tracking-widest">{t.soilMoisture}</p>
                    </div>
                 </div>
                 <button className="mt-8 w-full py-3 bg-natural-600 text-natural-50 rounded-xl text-xs font-black uppercase tracking-widest italic shadow-lg shadow-natural-600/20 active:scale-95 transition-all">
                   {t.activateDrip}
                 </button>
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-5 font-black text-8xl text-natural-600 pointer-events-none italic">H2O</div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm">
              <h3 className="font-bold text-natural-600 mb-4 tracking-tighter">{t.quickOps}</h3>
              <div className="space-y-2">
                 {[
                   { t: t.optimizeFertilizer, emoji: '💊', color: 'bg-natural-50 text-natural-600', view: 'dashboard' },
                   { t: t.govtSchemes, emoji: '🏛️', color: 'bg-natural-100 text-natural-500', view: 'schemes' },
                   { t: t.pestPrediction, emoji: '🦋', color: 'bg-amber-50 text-amber-600', view: 'dashboard' },
                   { t: t.dataExport, emoji: '📊', color: 'bg-blue-50 text-blue-600', view: 'dashboard' },
                 ].map((op, i) => (
                   <button 
                    key={i} 
                    onClick={() => op.view !== 'dashboard' && setView(op.view as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-natural-200 transition-all font-bold text-xs uppercase tracking-tight text-natural-700 italic group active:scale-95`}
                   >
                      <span className={`p-2 rounded-lg ${op.color} group-hover:scale-110 transition-transform`}>{op.emoji}</span>
                      {op.t}
                   </button>
                 ))}
              </div>
           </div>

           {/* Emergency Alert Area */}
           <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 shadow-inner">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mt-1 shrink-0"></div>
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">{t.pestWarning}</p>
                <p className="text-xs text-red-700 font-medium leading-tight mt-1 whitespace-pre-wrap">
                  {t.locustAlert}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DiseaseScanner({ language }: { language: Language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = translations[language];

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    processImage(file);
  };

  const processImage = async (file: File | Blob) => {
    setLoading(true);
    setResult(null);
    try {
      const base64 = await toBase64(file as File);
      const res = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: base64.split(',')[1],
          language 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      
      setResult(data);
    } catch (e: any) {
      console.error(e);
      alert(language === 'en' ? `Error: ${e.message}` : `خرابی: ${e.message}`);
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

  const startCamera = async () => {
    setCameraOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert(language === 'en' ? "Could not access camera" : "کیمرہ تک رسائی حاصل نہیں ہو سکی");
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            processImage(blob);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm relative overflow-hidden group">
         <div className="absolute -top-24 -right-24 w-48 h-48 bg-natural-100 rounded-full blur-3xl opacity-50"></div>
         {!result && !loading && (
           <div className="text-center py-12 relative z-10">
             <div className="mb-6 inline-block p-4 bg-natural-100 rounded-full border border-natural-200">
               <Camera className="w-12 h-12 text-natural-600" />
             </div>
             <h2 className="text-3xl font-bold mb-4 font-heading text-natural-700">{translations[language].diseaseScan}</h2>
             <p className="text-natural-400 mb-8 max-w-md mx-auto italic font-medium leading-relaxed">
               {language === 'en' 
                ? "Capture or upload leaf patterns for real-time symptom analysis and organic intervention advice."
                : "ریئل ٹائم علامات کے تجزیہ اور نامیاتی مداخلت کے مشورے کے لیے پتیوں کے نمونوں کو کیپچر یا اپ لوڈ کریں۔"}
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label className="px-8 py-4 bg-natural-600 text-white rounded-2xl font-black uppercase tracking-widest italic cursor-pointer hover:bg-natural-700 shadow-xl active:scale-95 transition-all">
                  {language === 'en' ? "Upload Photo" : "تصویر اپ لوڈ کریں"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
                <button 
                  onClick={startCamera}
                  className="px-8 py-4 bg-natural-100 text-natural-600 rounded-2xl font-black uppercase tracking-widest italic hover:bg-natural-200 shadow-sm border border-natural-200"
                >
                  {language === 'en' ? "Open Camera" : "کیمرہ کھولیں"}
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
             <h3 className="text-xl font-bold">{language === 'en' ? "Analyzing Symptoms..." : "علامات کا تجزیہ کیا جا رہا ہے..."}</h3>
             <p className="text-natural-400 mt-2">{language === 'en' ? "Comparing against 50,000+ disease patterns" : "50,000 سے زیادہ بیماریوں کے نمونوں کے ساتھ موازنہ"}</p>
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
                        <Droplets size={18} className="text-blue-500" /> {language === 'en' ? "Treatments" : "علاج"}
                      </h4>
                      <ul className="space-y-2">
                        {result.treatments?.map((t: string, i: number) => (
                          <li key={i} className="text-sm text-natural-600 flex items-start gap-2 italic">
                            <span className="text-blue-500 font-bold">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-emerald-800">
                        <Leaf size={18} className="text-emerald-500" /> {language === 'en' ? "Organic Options" : "نامیاتی اختیارات"}
                      </h4>
                      <ul className="space-y-2">
                        {result.organicAlternatives?.map((t: string, i: number) => (
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
                    {t.scanAnother}
                  </button>
               </div>
               
               <div className="w-full md:w-72 aspect-square rounded-3xl bg-natural-100 overflow-hidden border-4 border-white shadow-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <img src="https://images.unsplash.com/photo-1597103403300-8b1e4e6f4770?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Plant Leaf"/>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-[10px] opacity-70 uppercase font-black">{language === 'en' ? 'AI Segmentation' : 'اے آئی سیگمنٹیشن'}</p>
                    <p className="font-bold">{t.detectedAreas}</p>
                  </div>
               </div>
             </div>
           </div>
         )}
       </div>

       {cameraOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-natural-700/90 p-6 backdrop-blur-sm">
           <div className="w-full max-w-sm aspect-[9/16] bg-natural-600 rounded-[40px] border-8 border-natural-500 relative overflow-hidden shadow-2xl">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-natural-500/50 rounded-full backdrop-blur-md"></div>
             <button onClick={stopCamera} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-md"><X size={24}/></button>
             
             <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-6 px-8 text-center pointer-events-none">
                <p className="text-white text-sm font-bold shadow-lg bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md italic font-sans">{language === 'en' ? "Target leaf patterns" : "پتی کے نمونوں کو نشانہ بنائیں"}</p>
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center active:scale-95 transition-all shadow-2xl pointer-events-auto bg-white/20 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg shadow-white/20"></div>
                </button>
             </div>
             <canvas ref={canvasRef} className="hidden" />
           </div>
         </div>
       )}
    </div>
  );
}

function AIChatView({ user, language }: { user: any, language: Language }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: language === 'en' 
      ? `Hello ${user?.displayName?.split(' ')[0] || 'Farmer'}! I'm your AgroSmart AI Assistant. How can I help you today? You can ask me about crops, weather, or pest control.`
      : `ہیلو ${user?.displayName?.split(' ')[0] || 'کاشتکار'}! میں آپ کا ایگرو اسمارٹ اے آئی اسسٹنٹ ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟ آپ مجھ سے فصلوں، موسم، یا کیڑوں پر قابو پانے کے بارے میں پوچھ سکتے ہیں۔` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language, history })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      
      if (data.text) {
        setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      } else {
        throw new Error("No response from advisor");
      }
    } catch (e: any) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { role: 'ai', text: language === 'en' ? `Advisor Error: ${e.message}. Please try again.` : `ایڈوائزر کی خرابی: ${e.message}۔ براہ کرم دوبارہ کوشش کریں۔` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white rounded-[40px] border border-natural-200 overflow-hidden shadow-2xl relative">
       <div className="p-5 border-b border-natural-100 flex items-center justify-between bg-natural-600 text-white relative z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight italic">AI Advisor</h3>
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest italic leading-none mt-0.5 animate-pulse">● Online & Ready</p>
            </div>
          </div>
          <button className="text-white/50 hover:text-white transition-colors"><Info size={18} /></button>
       </div>

       <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-natural-50/50 scrollbar-hide">
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-natural-600 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-natural-600 rounded-full"></div>
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
               <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${m.role === 'user' 
                 ? 'bg-natural-600 text-white rounded-tr-none font-medium' 
                 : 'bg-white text-natural-700 border border-natural-100 rounded-tl-none italic'}`}>
                  {m.text}
               </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start relative z-10">
               <div className="bg-white px-5 py-4 rounded-3xl rounded-tl-none border border-natural-100 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-natural-400 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                    <span className="w-1.5 h-1.5 bg-natural-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-natural-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
                    <span className="text-[10px] text-natural-300 font-black uppercase tracking-widest ml-2 italic">Generating</span>
                  </div>
               </div>
            </div>
          )}
       </div>

       <form onSubmit={send} className="p-6 bg-white border-t border-natural-100 flex flex-col gap-4 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="flex gap-4">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'en' ? "Consult with AI about your farm..." : "اپنے فارم کے بارے میں اے آئی سے مشورہ کریں..."}
              className="flex-1 px-8 py-4 bg-natural-50 text-natural-700 border border-natural-200 rounded-full focus:outline-none focus:ring-2 focus:ring-natural-600 transition-all text-sm font-medium italic shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 bg-natural-600 text-white rounded-full shadow-xl shadow-natural-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all hover:bg-natural-700"
            >
              <Zap className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 text-[9px] font-black uppercase italic tracking-widest text-natural-400 whitespace-nowrap scrollbar-hide px-4">
             <button type="button" onClick={() => setInput('Wheat sowing advice for Punjab?')} className="hover:text-natural-600 transition-colors">{language === 'en' ? 'Punjab Wheat Advice' : 'پنجاب گندم مشورہ'}</button>
             <button type="button" onClick={() => setInput('Organic pest control for citrus in Sargodha?')} className="hover:text-natural-600 transition-colors">{language === 'en' ? 'Sargodha Citrus' : 'سرگودھا مالٹا'}</button>
             <button type="button" onClick={() => setInput('Current Kissan Card benefits?')} className="hover:text-natural-600 transition-colors">{language === 'en' ? 'Kissan Card Info' : 'کسان کارڈ معلومات'}</button>
          </div>
       </form>
    </div>
  );
}

function AdminView({ user, language }: { user: FirebaseUser, language: Language }) {
  const t = translations[language];
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
             <div>
                <h2 className="text-2xl font-bold text-natural-600 font-heading tracking-tight underline decoration-natural-300 decoration-4 underline-offset-8">{t.adminPanel}</h2>
                <p className="text-sm text-natural-400 mt-4 italic">{language === 'en' ? 'Operator' : 'آپریٹر'}: {user.email}</p>
             </div>
             <button 
              onClick={() => signOut(auth)}
              className="px-6 py-2 bg-natural-100 text-natural-600 border border-natural-200 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-natural-600 hover:text-white transition-all font-sans"
             >
               {t.signOut}
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

// --- Market Intelligence View ---
function MarketIntelligenceView({ language }: { language: Language }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [city, setCity] = useState("Lahore");
  const [activeTab, setActiveTab] = useState<'mandi' | 'supplies' | 'analytics'>('mandi');
  
  const cities = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan", "Sialkot", "Bahawalpur", "Peshawar", "Quetta", "Hyderabad"];
  const t = translations[language];

  useEffect(() => {
    fetchMarketData();
  }, [city]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market-intelligence?city=${city}&language=${language}`);
      const intel = await res.json();
      setData(intel);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PriceTicker language={language} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-natural-200">
        <div className="flex items-center gap-4">
          <TrendingUp className="text-natural-600" />
          <h2 className="text-xl font-bold text-natural-600">{t.marketIntelTitle}</h2>
        </div>
        <div className="flex gap-2 h-10">
          <select 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-1 bg-natural-50 border border-natural-200 rounded-xl text-sm font-bold text-natural-600 focus:outline-none focus:ring-2 focus:ring-natural-300"
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={fetchMarketData}
            className="p-2.5 bg-natural-600 text-white rounded-xl hover:bg-natural-700 transition-all active:scale-95"
          >
            <Activity size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-natural-100 rounded-2xl w-fit">
        {[
          { id: 'mandi', label: t.mandiRates, icon: TrendingUp },
          { id: 'supplies', label: t.agriSupplies, icon: Sprout },
          { id: 'analytics', label: "AI Analytics", icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id ? 'bg-white text-natural-600 shadow-sm' : 'text-natural-400 hover:text-natural-600'}
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-white border border-natural-100 rounded-3xl animate-pulse"></div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === 'mandi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.mandiPrices?.map((price: any, i: number) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-natural-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                      <TrendingUp size={80} className={price.trend === 'bullish' ? 'text-emerald-500' : 'text-red-500'} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-natural-400 mb-1">{t.mandiAlert}</p>
                        <h3 className="text-2xl font-bold text-natural-600">{price.crop}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${price.trend === 'bullish' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {price.trend === 'bullish' ? 'Bullish' : 'Bearish'}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-medium text-natural-500">{t.currentRate}</p>
                        <p className="text-3xl font-black text-natural-700 italic">Rs. {price.currentPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <p className="text-natural-400">{t.aiPredicted30d}</p>
                        <p className="font-bold text-emerald-600">Rs. {price.prediction30d.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-natural-50 rounded-2xl border border-dashed border-natural-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-natural-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-natural-500">{t.recommendation}</p>
                      </div>
                      <p className="text-xs font-bold text-natural-600 italic">"{price.recommendation}"</p>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center text-[10px] font-black text-natural-400 uppercase tracking-widest">
                       <span>{t.demand}: {price.demandLevel}</span>
                       <span>{price.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'supplies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.supplies?.map((item: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-natural-200 hover:border-natural-400 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-natural-400 mb-1">{item.brand}</p>
                    <h4 className="font-bold text-natural-700 mb-4">{item.item}</h4>
                    <div className="flex justify-between items-center">
                       <p className="text-lg font-black text-natural-600 italic">Rs. {item.price.toLocaleString()}</p>
                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{item.availability}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-natural-200 shadow-sm overflow-hidden min-h-[400px]">
                    <h3 className="text-lg font-bold text-natural-600 mb-6">{t.aiForecast}</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.mandiPrices?.[0]?.history || []}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#414141" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#414141" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="price" stroke="#414141" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="bg-natural-600 p-6 rounded-[32px] text-white overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                       <h4 className="font-bold mb-4 italic text-sm">{t.aiMarketInsights}</h4>
                       <ul className="space-y-4">
                          {data?.insights?.map((insight: string, i: number) => (
                            <li key={i} className="flex gap-3 text-xs italic font-medium leading-relaxed opacity-90">
                               <span className="text-natural-300 font-black tracking-tighter">0{i+1}.</span>
                               {insight}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="bg-emerald-600 p-6 rounded-[32px] text-white">
                       <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">{t.bestSellingWindow}</h4>
                       <p className="text-xl font-bold italic mb-4">June 15 - June 30</p>
                       <p className="text-xs font-medium opacity-90 leading-relaxed italic">
                         {t.sellAdvice}
                       </p>
                    </div>
                 </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriceTicker({ language }: { language: Language }) {
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/landscape-updates?language=${language}`)
      .then(res => res.json())
      .then(data => setPrices(data.marketPrices || []))
      .catch(console.error);
  }, [language]);

  return (
    <div className="w-full bg-natural-600 text-white py-2 overflow-hidden rounded-xl border border-natural-500 shadow-xl shadow-natural-600/10">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-8 border-r border-natural-500/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-natural-300">{item.crop}</span>
            <span className="text-sm font-bold italic">{item.price}</span>
            <span className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.trend === 'up' ? '▲' : '▼'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketPriceView({ language }: { language: Language }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/landscape-updates?language=${language}`)
      .then(res => res.json())
      .then(d => {
        const prices = d.marketPrices || [];
        setData(prices);
        if (prices.length > 0) {
          setSelectedCrop(prices[0].crop);
          setChartData(prices[0].history || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [language]);

  const handleCropSelect = (crop: any) => {
    setSelectedCrop(crop.crop);
    setChartData(crop.history || []);
  };

  if (loading) return <div className="py-24 text-center animate-pulse"><TrendingUp size={48} className="mx-auto mb-4 text-natural-200" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-natural-600 flex items-center gap-3">
             <TrendingUp className="text-natural-400" />
             {language === 'en' ? "Market Trends & Mandi Prices (Pakistan)" : "مارکیٹ کے رجحانات اور منڈی کی قیمتیں (پاکستان)"}
          </h2>

          <div className="mb-12 bg-natural-50 p-6 rounded-3xl border border-natural-100">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-lg font-bold text-natural-700">{selectedCrop} {language === 'en' ? "Price Trend" : "قیمت کا رجحان"}</h3>
                   <p className="text-xs text-natural-400 italic">Rs. / 40kg (Maund)</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-natural-600 italic">
                      {data.find(c => c.crop === selectedCrop)?.price}
                   </p>
                </div>
             </div>
             
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                         <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#415a4d" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#415a4d" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#A3A3A3'}}
                      />
                      <YAxis 
                        hide 
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#415a4d" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => handleCropSelect(item)}
                  className={`p-6 rounded-2xl border transition-all text-left flex justify-between items-center group
                    ${selectedCrop === item.crop 
                      ? 'bg-natural-600 text-white border-natural-600 shadow-xl scale-[1.02]' 
                      : 'bg-natural-50 text-natural-700 border-natural-100 hover:bg-white hover:shadow-lg'}`}
                >
                   <div>
                      <p className={`text-[10px] font-black uppercase mb-1 tracking-widest ${selectedCrop === item.crop ? 'text-natural-300' : 'text-natural-400'}`}>
                        {language === 'en' ? "Regional Market" : "علاقائی مارکیٹ"}
                      </p>
                      <h3 className="text-lg font-bold">{item.crop}</h3>
                   </div>
                   <div className="text-right">
                      <p className={`text-xl font-black italic ${selectedCrop === item.crop ? 'text-white' : 'text-natural-600'}`}>
                        {item.price}
                      </p>
                      <span className={`text-[10px] font-black uppercase italic ${selectedCrop === item.crop ? 'text-emerald-300' : (item.trend === 'up' ? 'text-emerald-500' : 'text-red-500')}`}>
                         {item.trend === 'up' ? '↗ Bullish' : item.trend === 'down' ? '↘ Bearish' : '→ Stable'}
                      </span>
                   </div>
                </button>
             ))}
          </div>
       </div>
    </div>
  );
}

function WeatherView({ language }: { language: Language }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/landscape-updates?language=${language}`)
      .then(res => res.json())
      .then(d => {
        setData(d.weather);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [language]);

  if (loading) return <div className="py-24 text-center animate-pulse"><CloudSun size={48} className="mx-auto mb-4 text-natural-200" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm text-center">
          <div className="mb-8">
             <CloudSun size={64} className="mx-auto text-blue-400 mb-4" />
             <h2 className="text-4xl font-bold text-natural-700">{data?.temp}°C</h2>
             <p className="text-lg font-black uppercase italic text-natural-400 tracking-widest">{data?.condition}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             <div className="p-4 bg-natural-50 rounded-2xl border border-natural-100">
                <p className="text-[10px] font-black uppercase text-natural-400 mb-1 tracking-tighter">Humidity</p>
                <p className="text-lg font-bold text-blue-600">{data?.humidity}%</p>
             </div>
             <div className="p-4 bg-natural-50 rounded-2xl border border-natural-100">
                <p className="text-[10px] font-black uppercase text-natural-400 mb-1 tracking-tighter">Wind Speed</p>
                <p className="text-lg font-bold text-natural-600">{data?.windSpeed} km/h</p>
             </div>
             <div className="p-4 bg-natural-50 rounded-2xl border border-natural-100 col-span-2 sm:col-span-1">
                <p className="text-[10px] font-black uppercase text-natural-400 mb-1 tracking-tighter">Precipitation</p>
                <p className="text-lg font-bold text-emerald-600">12%</p>
             </div>
          </div>
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl text-blue-800 italic font-medium">
             {language === 'en' 
              ? "NASA Grounding: Optimal soil moisture for paddy sowing detected in Southern Punjab belt. Recommend irrigation by Fri PM."
              : "ناسا گراؤنڈنگ: جنوبی پنجاب پٹی میں دھان کی بوائی کے لیے ٹیڑھی مٹی کی نمی کا پتہ چلا ہے۔ جمعہ کی سہ پہر تک آبپاشی کی سفارش کی جاتی ہے۔"}
          </div>
       </div>
    </div>
  );
}

function CalendarView({ language }: { language: Language }) {
  const [calendar, setCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agri-calendar?language=${language}`)
      .then(res => res.json())
      .then(d => {
        setCalendar(d.calendar || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [language]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-natural-600 flex items-center gap-3">
             <Calendar className="text-natural-400" />
             {language === 'en' ? "Your seasonal Workflow" : "آپ کا موسمی کام"}
          </h2>
          {loading ? (
             <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-natural-50 rounded-2xl"></div>)}
             </div>
          ) : (
             <div className="space-y-4">
                {calendar.map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 border-l-4 border-emerald-500 bg-natural-50 rounded-r-2xl transition-all hover:bg-white hover:shadow-lg">
                      <div className="w-24 shrink-0">
                         <p className="text-sm font-black uppercase text-emerald-600 italic">{item.month}</p>
                         <p className="text-[10px] font-bold text-natural-400">{item.crop}</p>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                         {item.activities.map((act: string, j: number) => (
                            <span key={j} className="px-3 py-1 bg-white border border-natural-200 rounded-full text-xs font-medium text-natural-700 italic">
                               {act}
                            </span>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}

function SchemesView({ language }: { language: Language }) {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/govt-schemes?language=${language}`)
      .then(res => res.json())
      .then(d => {
        setSchemes(d.schemes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [language]);

  if (loading) return <div className="py-24 text-center animate-pulse"><Info size={48} className="mx-auto mb-4 text-natural-200" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white rounded-3xl p-8 border border-natural-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-natural-600 flex items-center gap-3">
             <Info className="text-natural-400" />
             {language === 'en' ? "Pakistan Govt Agriculture Schemes" : "پاکستان حکومتی زراعتی اسکیمیں"}
          </h2>
          <div className="grid grid-cols-1 gap-6">
             {schemes.map((scheme, i) => (
                <div key={i} className="p-6 bg-natural-50 rounded-2xl border border-natural-100 group hover:bg-white hover:shadow-xl transition-all">
                   <h3 className="text-lg font-bold text-natural-700 mb-2">{scheme.title}</h3>
                   <p className="text-sm text-natural-500 mb-4 italic leading-relaxed">{scheme.description}</p>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Eligibility</span>
                     <p className="text-xs font-bold text-natural-600">{scheme.eligibility}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
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
