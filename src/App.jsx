import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './hooks/useApp';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/features/groups/Dashboard';
import GroupDetail from './components/features/groups/GroupDetail';
import FriendManager from './components/features/friends/FriendManager';
import ActivityHistory from './components/features/history/ActivityHistory';
import Settings from './components/features/groups/Settings';
import Onboarding from './components/features/groups/Onboarding';
import { Calculator, Sparkles } from 'lucide-react';

export default function App() {
  const { loading, settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 's') setActiveTab('settings');
      if (e.key === 'h') setActiveTab('history');
      if (e.key === 'f') setActiveTab('friends');
      if (e.key === 'Escape') {
        if (selectedGroupId) setSelectedGroupId(null);
        else setActiveTab('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedGroupId]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleBackToDashboard = () => {
    setSelectedGroupId(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading NexSplit...</p>
      </div>
    );
  }

  if (!settings.onboardingCompleted) {
    return <Onboarding onComplete={() => updateSettings({ onboardingCompleted: true })} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">

      {/* Background Ornaments */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 dark:bg-blue-400/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 dark:bg-indigo-400/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f8fafc]/80 dark:bg-[#020617]/80 backdrop-blur-md px-6 py-4 border-b border-transparent dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setSelectedGroupId(null); setActiveTab('dashboard'); }}
          >
            <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                Nex<span className="text-blue-600 dark:text-blue-400">Split</span>
              </h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                Version 2.1 <Sparkles size={8} className="text-blue-500" />
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-400">Status: Running Locally</div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-8 pb-32">
        <AnimatePresence mode="wait">
          {selectedGroupId ? (
            <motion.div
              key="group-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GroupDetail
                groupId={selectedGroupId}
                onBack={handleBackToDashboard}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard onSelectGroup={setSelectedGroupId} />
              )}
              {activeTab === 'friends' && (
                <FriendManager />
              )}
              {activeTab === 'history' && (
                <ActivityHistory />
              )}
              {activeTab === 'settings' && (
                <Settings />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Navigation */}
      <Navbar
        activeTab={selectedGroupId ? 'dashboard' : activeTab}
        onTabChange={(tab) => {
          setSelectedGroupId(null);
          setActiveTab(tab);
        }}
      />

    </div>
  );
}
