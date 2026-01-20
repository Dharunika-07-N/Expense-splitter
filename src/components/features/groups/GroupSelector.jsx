import { useState } from 'react';
import { Users, Home, Calendar, Plus, ChevronDown, Check, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../../ui/BaseUI';

export default function GroupSelector({ groups, activeGroupId, onSelect, onAddGroup }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('trip');

    const activeGroup = groups.find(g => g.id === activeGroupId) || { name: 'Personal Ledger', type: 'other' };

    const handleAdd = () => {
        if (newName.trim()) {
            onAddGroup(newName.trim(), newType);
            setNewName('');
            setShowAdd(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/50 transition-all group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-[14px] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
                    {getIconForType(activeGroup.type)}
                </div>
                <div className="text-left relative z-10">
                    <div className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mb-0.5">Focus Context</div>
                    <div className="font-black text-slate-900 dark:text-white leading-none tracking-tight font-outfit uppercase text-xs">{activeGroup.name}</div>
                </div>
                <ChevronDown size={14} className={`ml-4 text-slate-300 dark:text-slate-700 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[90]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 8, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-full left-0 w-80 mt-2 bg-white dark:bg-slate-900 rounded-[38px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-2xl border border-slate-100 dark:border-slate-800 z-[100] overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Switch Cluster</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAdd(true); }}
                                    className="w-8 h-8 bg-slate-900 dark:bg-blue-600 text-white rounded-[10px] hover:rotate-90 transition-transform flex items-center justify-center shadow-lg"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="max-h-[360px] overflow-y-auto p-2">
                                <button
                                    onClick={() => { onSelect(null); setIsOpen(false); }}
                                    className={`w-full p-4 rounded-[26px] flex items-center gap-4 transition-all ${!activeGroupId ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-[14px] flex items-center justify-center text-slate-400">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <span className={`font-black uppercase text-[10px] tracking-widest ${!activeGroupId ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>Global</span>
                                        <div className={`font-black text-xs ${!activeGroupId ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-600'}`}>Personal Ledger</div>
                                    </div>
                                    {!activeGroupId && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                                </button>

                                {groups.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => { onSelect(g.id); setIsOpen(false); }}
                                        className={`w-full p-4 rounded-[26px] flex items-center gap-4 transition-all ${activeGroupId === g.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-[14px] flex items-center justify-center text-blue-500">
                                            {getIconForType(g.type)}
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className={`font-black uppercase text-[10px] tracking-widest ${activeGroupId === g.id ? 'text-blue-600' : 'text-slate-900 dark:text-slate-100'}`}>{g.name}</span>
                                            <div className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">{g.type} Profile</div>
                                        </div>
                                        {activeGroupId === g.id && <Check size={18} className="text-blue-500" />}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {showAdd && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6 border-t border-slate-50 dark:border-slate-800/50 bg-white dark:bg-slate-900 overflow-hidden"
                                    >
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Namespace Name"
                                            className="w-full mb-4 py-4 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                                            autoFocus
                                        />
                                        <div className="flex gap-2 mb-6">
                                            {['trip', 'home', 'project'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setNewType(t)}
                                                    className={`flex-1 py-3 rounded-[14px] text-[8px] font-black uppercase tracking-[0.2em] transition-all ${newType === t ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={handleAdd} variant="blue" size="sm" className="flex-1 rounded-[16px]">Initialize</Button>
                                            <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm" className="px-4 rounded-[16px]">Abort</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function getIconForType(type) {
    switch (type) {
        case 'trip': return <Calendar size={20} />;
        case 'home': return <Home size={20} />;
        case 'event': return <Users size={20} />;
        case 'project': return <Briefcase size={20} />;
        default: return <Users size={20} />;
    }
}
