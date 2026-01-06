import { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Contact, Check, UserPlus } from 'lucide-react';
import { pickContacts, isContactPickerSupported } from '../utils/contactPicker';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="space-y-6 animate-fade-in">
            {/* Search & Add Action */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search friends..."
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none w-full transition-all"
                    />
                </div>
                {isContactPickerSupported() && (
                    <button
                        onClick={handleContactPick}
                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"
                        title="Import from Contacts"
                    >
                        <Contact size={24} />
                    </button>
                )}
            </div>

            {/* Quick Picks */}
            {quickPicks.length > 0 && !searchTerm && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Recent</p>
                    <div className="flex flex-wrap gap-2">
                        {quickPicks.map(f => (
                            <motion.button
                                key={f.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(f.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected.includes(f.id)
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {selected.includes(f.id) && <Check size={14} className="inline mr-1" />}
                                {f.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends Grid */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    {searchTerm ? 'Search Results' : 'All Friends'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredFriends.map(f => (
                        <motion.button
                            key={f.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => onSelect(f.id)}
                            className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${selected.includes(f.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-white bg-white hover:border-slate-200 shadow-sm'
                                }`}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                style={{ backgroundColor: f.color }}
                            >
                                {f.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold text-sm truncate ${selected.includes(f.id) ? 'text-blue-700' : 'text-slate-700'}`}>
                                {f.name}
                            </span>
                            {selected.includes(f.id) && <div className="ml-auto text-blue-500"><Check size={16} /></div>}
                        </motion.button>
                    ))}

                    <AnimatePresence>
                        {!showManualAdd ? (
                            <motion.button
                                key="add-manual"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowManualAdd(true)}
                                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Plus size={18} />
                                </div>
                                <span className="font-semibold text-sm">Add New</span>
                            </motion.button>
                        ) : (
                            <motion.div
                                key="manual-form"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                className="col-span-2 sm:col-span-2 flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={manualName}
                                    onChange={(e) => setManualName(e.target.value)}
                                    autoFocus
                                    placeholder="Enter name..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                                    className="flex-1 px-4 py-2 border-2 border-blue-400 rounded-2xl outline-none"
                                />
                                <button
                                    onClick={handleManualAdd}
                                    className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
                                >
                                    <UserPlus size={20} />
                                </button>
                                <button
                                    onClick={() => setShowManualAdd(false)}
                                    className="p-3 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Empty State */}
            {filteredFriends.length === 0 && !showManualAdd && (
                <div className="text-center py-8 text-slate-400">
                    <Users size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No friends found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}
