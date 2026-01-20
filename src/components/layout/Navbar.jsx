import React from 'react';
import { LayoutGrid, Users, History, Settings as SettingsIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'dashboard', label: 'Groups', icon: LayoutGrid },
        { id: 'friends', label: 'Friends', icon: Users },
        { id: 'history', label: 'Activity', icon: History },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 flex gap-1 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-200/50"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === tab.id
                                ? 'text-slate-900'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="nav-bg"
                                className="absolute inset-0 bg-slate-900/5 rounded-2xl"
                                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                            />
                        )}
                        <tab.icon size={20} className={activeTab === tab.id ? 'text-blue-600' : ''} />
                        <span className={`text-xs font-black uppercase tracking-widest hidden md:inline ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                            }`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </motion.div>
        </nav>
    );
}
