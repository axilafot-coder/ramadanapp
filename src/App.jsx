import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ChevronRight, ChevronLeft, Plus, Minus, LayoutDashboard, ClipboardList, Trash2 } from 'lucide-react';

// Configuration
const DAYS_OF_RAMADAN = 30;
const DAILY_TARGET = 2000;
const STORAGE_KEY = 'ramadan_pro_local_v3_data';
const PROFILE_KEY = 'ramadan_pro_local_v3_profile';

const PRAYERS = [
  { id: 'fajr', name: 'Fajr', target: 2 },
  { id: 'dhuhr', name: 'Dhuhr', target: 4 },
  { id: 'asr', name: 'Asr', target: 2 },
  { id: 'maghrib', name: 'Maghrib', target: 2 },
  { id: 'isha', name: 'Isha', target: 2 },
];

const INITIAL_DAY_DATA = {
  fasting: true,
  prayers: {
    fajr: { completed: false, masjid: false, group: false, rawatib: 0 },
    dhuhr: { completed: false, masjid: false, group: false, rawatib: 0 },
    asr: { completed: false, masjid: false, group: false, rawatib: 0 },
    maghrib: { completed: false, masjid: false, group: false, rawatib: 0 },
    isha: { completed: false, masjid: false, group: false, rawatib: 0 },
  },
  tahajjudRakah: 0,
  taraweehCompleted: false,
  witrCompleted: false,
  duhaCompleted: false,
  quranJuz: 0,
  sadaqah: false,
  azkarCount: 0,
  haddad: false,
  salawatCount: 0,
  manualEvaluation: 50,
  reflections: ""
};

export default function App() {
  const [profile, setProfile] = useState({ name: '', gender: '' });
  const [activeTab, setActiveTab] = useState('log');
  const [selectedDay, setSelectedDay] = useState(1);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }

    if (savedData) {
      setAllData(JSON.parse(savedData));
    }

    setLoading(false);
  }, []);

  const persistData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAllData(data);
  };

  const saveProfile = (data) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    setProfile(data);
    setShowOnboarding(false);
  };

  const updateDayData = (day, updates) => {
    const dayExisting = allData[day] || { ...INITIAL_DAY_DATA };
    const newDayData = { ...dayExisting, ...updates };
    const newData = { ...allData, [day]: newDayData };
    persistData(newData);
  };

  const resetAllData = () => {
    if (window.confirm("Are you sure? This will delete all local progress.")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllData({});
    }
  };

  const calculateDayScore = (data) => {
    if (!data) return 0;
    let score = 0;

    PRAYERS.forEach(pDef => {
      const p = (data.prayers && data.prayers[pDef.id]) || INITIAL_DAY_DATA.prayers[pDef.id];

      if (p.completed) {
        score += 50;
        if (p.group) score += 50;
        if (p.masjid) score += 50;
      }

      score += (p.rawatib || 0) * 10;
    });

    if (data.fasting) score += 100;
    score += (data.tahajjudRakah || 0) * 50;
    if (data.taraweehCompleted) score += 200;
    if (data.quranJuz > 0) score += (data.quranJuz * 100);

    return score;
  };

  const currentDayData = allData[selectedDay] || INITIAL_DAY_DATA;
  const currentScore = calculateDayScore(currentDayData);
  const meterPercentage = Math.min(100, (currentScore / DAILY_TARGET) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500 gap-4">
        <Loader2 size={32} className="animate-spin opacity-50" />
        <div className="font-bold tracking-widest uppercase text-xs text-slate-500">Loading...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">RAMADAN <span className="text-emerald-500">PRO</span></h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Local Storage Edition</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Your Name</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all placeholder:text-slate-600"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setProfile({ ...profile, gender: 'male' })}
                  className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${profile.gender === 'male' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  Brother
                </button>
                <button 
                  onClick={() => setProfile({ ...profile, gender: 'female' })}
                  className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${profile.gender === 'female' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                >
                  Sister
                </button>
              </div>
            </div>

            <button 
              disabled={!profile.name || !profile.gender}
              onClick={() => saveProfile(profile)}
              className="w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all"
            >
              Start Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <header className="px-4 py-4 sticky top-0 bg-slate-950/95 backdrop-blur-lg z-40 border-b border-slate-800">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="text-lg font-black text-white italic">RAMADAN <span className="text-emerald-500">PRO</span></h1>
            <p className="text-xs text-slate-500 font-bold">Welcome, {profile.name}</p>
          </div>
          <div className="bg-emerald-500 px-4 py-2 rounded-full text-center">
            <span className="text-sm font-black text-slate-950">{Math.floor(currentScore)}</span>
            <p className="text-xs font-bold text-slate-950/70">Points</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <h2 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">30 Day Journey</h2>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const score = calculateDayScore(allData[day]);
                  const pct = (score / DAILY_TARGET) * 100;
                  const isActive = selectedDay === day;

                  let cellStyle = "bg-slate-800/50 text-slate-600";
                  if (score > 0) {
                    if (pct >= 80) cellStyle = "bg-emerald-500 text-slate-950 font-black";
                    else if (pct >= 40) cellStyle = "bg-emerald-600 text-emerald-100 font-black";
                    else cellStyle = "bg-emerald-900 text-emerald-300 font-black";
                  }

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setActiveTab('log');
                      }}
                      className={`aspect-square rounded-lg text-xs font-black transition-all ${cellStyle} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-105 active:scale-95'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={resetAllData}
              className="w-full bg-red-900/30 border border-red-900/50 text-red-400 py-2 rounded-lg text-xs font-bold uppercase hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Reset All Data
            </button>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 rounded-xl p-2 border border-slate-800">
              <button onClick={() => setSelectedDay(d => Math.max(1, d - 1))} className="p-2 text-slate-400 hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <span className="font-black text-xs uppercase">Day {selectedDay}</span>
              <button onClick={() => setSelectedDay(d => Math.min(30, d + 1))} className="p-2 text-slate-400 hover:text-white">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-black uppercase text-slate-500">Efficiency</span>
                <span className="text-xs font-black text-emerald-400">{Math.round(meterPercentage)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${meterPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-500 uppercase px-2">Prayers</h3>
              {PRAYERS.map(p => {
                const d = currentDayData.prayers?.[p.id] || { ...INITIAL_DAY_DATA.prayers[p.id] };

                return (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const ps = { ...(currentDayData.prayers || INITIAL_DAY_DATA.prayers) };
                        ps[p.id] = { ...d, completed: !d.completed };
                        updateDayData(selectedDay, { prayers: ps });
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${d.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <span className="flex-1 ml-3 text-xs font-bold">{p.name}</span>

                    <button
                      onClick={() => {
                        const ps = { ...(currentDayData.prayers || INITIAL_DAY_DATA.prayers) };
                        ps[p.id] = { ...d, group: !d.group };
                        updateDayData(selectedDay, { prayers: ps });
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ${d.group ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                    >
                      Grp
                    </button>

                    <button
                      onClick={() => {
                        const ps = { ...(currentDayData.prayers || INITIAL_DAY_DATA.prayers) };
                        ps[p.id] = { ...d, masjid: !d.masjid };
                        updateDayData(selectedDay, { prayers: ps });
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ml-1 ${d.masjid ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      Msj
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase">Quran Juz</p>
                <p className="text-sm font-black text-emerald-400">{currentDayData.quranJuz || 0}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateDayData(selectedDay, { quranJuz: Math.max(0, (currentDayData.quranJuz || 0) - 1) })}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => updateDayData(selectedDay, { quranJuz: (currentDayData.quranJuz || 0) + 1 })}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <label className="text-xs font-black text-slate-500 uppercase block mb-2">Reflections</label>
              <textarea
                value={currentDayData.reflections || ""}
                onChange={(e) => updateDayData(selectedDay, { reflections: e.target.value })}
                placeholder="What went well today?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[80px] resize-none"
              />
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 px-4 py-3 flex justify-around z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-500 scale-110' : 'text-slate-500'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-xs font-black uppercase">Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'text-emerald-500 scale-110' : 'text-slate-500'}`}
        >
          <ClipboardList size={20} />
          <span className="text-xs font-black uppercase">Journal</span>
        </button>
      </nav>
    </div>
  );
}
