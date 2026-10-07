import React from 'react';
import { 
  Bus, 
  MapPin, 
  PhoneCall, 
  Compass, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Share2,
  Landmark,
  Hospital,
  Utensils,
  Building
} from 'lucide-react';

export type AppTab = 
  | 'search' 
  | 'routes' 
  | 'near-me' 
  | 'stop' 
  | 'emergency' 
  | 'hospitals' 
  | 'restaurants' 
  | 'residential-hotels' 
  | 'tourist-spots' 
  | 'banks' 
  | 'admin';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenPublishGuide: () => void;
  onOpenEmergency: () => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublishGuide,
  onOpenEmergency,
  lang,
  setLang,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bangladesh Bus Route',
          text: 'Find Your Bus. Know Your Route. Go Anywhere in Bangladesh.',
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or unavailable
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('App link copied to clipboard!');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Top Banner & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6 text-emerald-100" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {lang === 'en' ? 'Bangladesh Bus Route' : 'বাংলাদেশ বাস রুট'}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-semibold uppercase">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                {lang === 'en' ? 'Find Your Bus. Know Your Route. Go Anywhere.' : 'বাস খুঁজুন। রুট জানুন। যেখানে ইচ্ছা যান।'}
              </p>
            </div>
          </div>

          {/* Quick Actions & High Priority Emergency Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🚨 HIGHEST PRIORITY EMERGENCY BUTTON */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 hover:scale-102 transition-all active:scale-95 animate-pulse"
              title="Immediate Emergency Numbers (999, Fire, Hospital, Police)"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'en' ? '🚨 EMERGENCY' : '🚨 জরুরি সেবা'}</span>
            </button>

            {/* How to Publish Freely button */}
            <button
              onClick={onOpenPublishGuide}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              title="How to publish this web app freely on Netlify for everyone"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Publish Freely Guide</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Share Web App"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Main Navigation Tabs */}
      <div className="hidden md:block bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 py-1.5">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Find Bus' : 'বাস খুঁজুন'}</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{lang === 'en' ? 'All Bus Routes' : 'সব বাস রুট'}</span>
            </button>

            <button
              onClick={() => setActiveTab('near-me')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'near-me'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === 'en' ? 'Bus Near Me' : 'কাছের বাস'}</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'emergency'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>{lang === 'en' ? 'Emergency' : 'জরুরি'}</span>
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-800 hover:bg-rose-50'
              }`}
            >
              <Hospital className="w-4 h-4 text-rose-600" />
              <span>{lang === 'en' ? 'Hospitals' : 'হাসপাতাল'}</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'restaurants'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>{lang === 'en' ? 'Restaurants' : 'রেস্টুরেন্ট'}</span>
            </button>

            <button
              onClick={() => setActiveTab('residential-hotels')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'residential-hotels'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50'
              }`}
            >
              <Building className="w-4 h-4 text-purple-600" />
              <span>{lang === 'en' ? 'Residential Hotels' : 'আবাসিক হোটেল'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tourist-spots')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'tourist-spots'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'en' ? 'Tourist Spots' : 'দর্শনীয় স্থান'}</span>
            </button>

            <button
              onClick={() => setActiveTab('banks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'banks'
                  ? 'bg-cyan-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-cyan-800 hover:bg-cyan-50'
              }`}
            >
              <Landmark className="w-4 h-4 text-cyan-600" />
              <span>{lang === 'en' ? 'Banks & ATMs' : 'ব্যাংক ও এটিএম'}</span>
            </button>
          </nav>

          {/* Admin link */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'admin'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Admin / Verify Data' : 'অ্যাডমিন'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Mobile-first requirement) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-1.5 py-1.5">
        <div className="grid grid-cols-6 gap-0.5 text-center">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-semibold ${
              activeTab === 'search' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <Bus className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'Find' : 'খুঁজুন'}</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-semibold ${
              activeTab === 'routes' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'Routes' : 'রুট'}</span>
          </button>

          <button
            onClick={() => setActiveTab('near-me')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-semibold ${
              activeTab === 'near-me' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'Near' : 'কাছে'}</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-bold ${
              activeTab === 'emergency' ? 'text-red-700 bg-red-50' : 'text-red-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'SOS' : 'জরুরি'}</span>
          </button>

          <button
            onClick={() => setActiveTab('residential-hotels')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-semibold ${
              activeTab === 'residential-hotels' ? 'text-purple-800 bg-purple-50' : 'text-slate-600'
            }`}
          >
            <Building className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'Hotels' : 'আবাসিক'}</span>
          </button>

          <button
            onClick={() => setActiveTab('banks')}
            className={`flex flex-col items-center py-1 rounded-lg text-[10px] font-semibold ${
              activeTab === 'banks' ? 'text-cyan-800 bg-cyan-50' : 'text-slate-600'
            }`}
          >
            <Landmark className="w-4 h-4 mb-0.5" />
            <span>{lang === 'en' ? 'ATM' : 'এটিএম'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
