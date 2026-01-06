import { useState } from 'react';
import { Users, Home, Calendar, Plus, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupSelector({ groups, activeGroupId, onSelect, onAddGroup }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('trip');

    const activeGroup = groups.find(g => g.id === activeGroupId) || { name: 'Personal', type: 'other' };

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
                className="flex items-center gap-3 bg-white px-6 py-4 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    {getIconForType(activeGroup.type)}
                </div>
                <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Group</div>
                    <div className="font-black text-slate-900 leading-none">{activeGroup.name}</div>
                </div>
                <ChevronDown size={18} className={`ml-2 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 w-64 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Group</span>
                            <button onClick={() => setShowAdd(true)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:rotate-90 transition-transform">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            <button
                                onClick={() => { onSelect(null); setIsOpen(false); }}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${!activeGroupId ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <span className="font-bold text-slate-700">Personal</span>
                                {!activeGroupId && <Check size={16} className="ml-auto text-blue-500" />}
                            </button>

                            {groups.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => { onSelect(g.id); setIsOpen(false); }}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${activeGroupId === g.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                        {getIconForType(g.type)}
                                    </div>
                                    <span className="font-bold text-slate-700">{g.name}</span>
                                    {activeGroupId === g.id && <Check size={16} className="ml-auto text-blue-500" />}
                                </button>
                            ))}
                        </div>

                        {showAdd && (
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Group Name"
                                    className="w-full mb-3 text-sm p-3 border rounded-xl"
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-3">
                                    {['trip', 'home', 'event'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setNewType(t)}
                                            className={`flex-1 p-2 rounded-lg text-[10px] font-bold uppercase transition-all ${newType === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAdd} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Create</button>
                                    <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm">✕</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getIconForType(type) {
    switch (type) {
        case 'trip': return <Calendar size={18} />;
        case 'home': return <Home size={18} />;
        case 'event': return <Users size={18} />;
        default: return <Users size={18} />;
    }
}
