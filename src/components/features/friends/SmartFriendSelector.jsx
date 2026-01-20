import { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Contact, Check, UserPlus } from 'lucide-react';
import { pickContacts, isContactPickerSupported } from '../../../utils/contactPicker';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from '../../ui/BaseUI';

export default function SmartFriendSelector({
    friends,
    onAddFromContact,
    onAddManual,
    onSelect,
    selected = []
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [manualName, setManualName] = useState('');
    const [recentNames, setRecentNames] = useState([]);

    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recentFriends') || '[]');
        setRecentNames(recent);
    }, []);

    const handleContactPick = async () => {
        const contacts = await pickContacts();
        if (contacts) {
            contacts.forEach(contact => {
                onAddFromContact(contact.name, contact.phone);
            });
            updateRecentFriends(contacts.map(c => c.name));
        }
    };

    const handleManualAdd = () => {
        if (manualName.trim()) {
            onAddManual(manualName.trim());
            updateRecentFriends([manualName.trim()]);
            setManualName('');
            setShowManualAdd(false);
        }
    };

    const updateRecentFriends = (names) => {
        const updated = [...new Set([...names, ...recentNames])].slice(0, 8);
        setRecentNames(updated);
        localStorage.setItem('recentFriends', JSON.stringify(updated));
    };

    const fuse = useMemo(() => new Fuse(friends, {
        keys: ['name'],
        threshold: 0.3
    }), [friends]);

    const filteredFriends = searchTerm
        ? fuse.search(searchTerm).map(r => r.item)
        : friends;

    const quickPicks = useMemo(() => {
        return friends.filter(f => recentNames.includes(f.name)).slice(0, 6);
    }, [friends, recentNames]);

    return (
        <div className="space-y-8">
            {/* Search & Add Action */}
            <div className="flex gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search friends..."
                        className="pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] w-full shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 dark:text-white"
                    />
                </div>
                {isContactPickerSupported() && (
                    <Button
                        variant="secondary"
                        size="xl"
                        onClick={handleContactPick}
                        className="rounded-[28px] px-8"
                        title="Import from Contacts"
                    >
                        <Contact size={24} />
                    </Button>
                )}
            </div>

            {/* Quick Picks */}
            {quickPicks.length > 0 && !searchTerm && (
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-2">Recently Selected</p>
                    <div className="flex flex-wrap gap-3">
                        {quickPicks.map(f => (
                            <motion.button
                                key={f.id}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(f.id)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selected.includes(f.id)
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                {selected.includes(f.id) && <Check size={14} className="inline mr-2" />}
                                {f.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends Grid */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-2">
                    {searchTerm ? 'Search Results' : 'Participant List'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredFriends.map(f => (
                        <motion.button
                            key={f.id}
                            layout
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(f.id)}
                            className={`p-5 rounded-[28px] border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden ${selected.includes(f.id)
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-xl shadow-blue-50 dark:shadow-none'
                                : 'border-white dark:border-transparent bg-white dark:bg-slate-900/50 hover:border-slate-100 dark:hover:border-slate-800 shadow-sm'
                                }`}
                        >
                            <div
                                className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-black text-base shadow-lg transform group-hover:-rotate-6 transition-transform"
                                style={{ backgroundColor: f.color }}
                            >
                                {f.avatar || f.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className={`font-black text-sm truncate ${selected.includes(f.id) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {f.name}
                                </span>
                                {selected.includes(f.id) && (
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Selected</span>
                                )}
                            </div>
                            {selected.includes(f.id) && (
                                <div className="ml-auto text-blue-500 absolute top-4 right-4 animate-in zoom-in-50 duration-300">
                                    <Check size={18} />
                                </div>
                            )}
                        </motion.button>
                    ))}

                    <AnimatePresence mode="wait">
                        {!showManualAdd ? (
                            <motion.button
                                key="add-manual"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowManualAdd(true)}
                                className="p-5 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-600 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-[14px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus size={20} />
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest">Add New</span>
                            </motion.button>
                        ) : (
                            <motion.div
                                key="manual-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="col-span-2 sm:col-span-2 flex gap-3"
                            >
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={manualName}
                                        onChange={(e) => setManualName(e.target.value)}
                                        autoFocus
                                        placeholder="Friend's Name..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-[24px] outline-none font-black text-slate-900 dark:text-white shadow-xl shadow-blue-50 dark:shadow-none"
                                    />
                                </div>
                                <Button
                                    variant="blue"
                                    onClick={handleManualAdd}
                                    className="rounded-[24px] px-6"
                                >
                                    <UserPlus size={24} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowManualAdd(false)}
                                    className="rounded-[24px] px-4 text-slate-400 hover:text-slate-900"
                                >
                                    ✕
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Empty State */}
            {filteredFriends.length === 0 && !showManualAdd && (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/20 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                    <Users size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No friends found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}
