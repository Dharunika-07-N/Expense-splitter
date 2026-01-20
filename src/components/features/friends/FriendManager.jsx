import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, Phone, Mail, Edit2, Trash2, ChevronRight, Filter, Sparkles, UserPlus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Button, Card, Input } from '../../ui/BaseUI';
import { createFriend } from '../../../utils/storage';

export default function FriendManager() {
    const { friends, addFriend, updateFriend, expenses } = useApp();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingFriend, setEditingFriend] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.phone.includes(search)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        if (editingFriend) {
            updateFriend(editingFriend.id, formData);
            setEditingFriend(null);
        } else {
            addFriend(createFriend(formData.name, formData.phone, formData.email));
        }

        setFormData({ name: '', phone: '', email: '' });
        setIsAdding(false);
    };

    const startEdit = (friend) => {
        setEditingFriend(friend);
        setFormData({ name: friend.name, phone: friend.phone || '', email: friend.email || '' });
        setIsAdding(true);
    };

    const getFriendStats = (friendId) => {
        const participation = expenses.filter(e => e.payer === friendId || e.splitAmong.includes(friendId));
        const totalPaid = expenses.filter(e => e.payer === friendId).reduce((sum, e) => sum + e.amount, 0);
        return { count: participation.length, totalPaid };
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="absolute top-[-200%] left-[-10%] w-[30%] h-[500%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <User className="text-white" size={24} />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit">Contact Hub</h2>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] ml-15">Manage your spending network</p>
                </div>

                <Button
                    onClick={() => { setIsAdding(true); setEditingFriend(null); setFormData({ name: '', phone: '', email: '' }); }}
                    variant="blue"
                    size="xl"
                    className="rounded-[32px] shadow-2xl shadow-blue-500/30 px-10 relative z-10"
                >
                    <UserPlus size={20} />
                    Onboard Friend
                </Button>
            </div>

            {/* Search Hub */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors" size={20} />
                <input
                    placeholder="Search by identity or contact detail..."
                    className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900/50 rounded-[28px] font-bold text-slate-900 dark:text-white outline-none shadow-sm border border-slate-100 dark:border-slate-800/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-outfit text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="col-span-full"
                        >
                            <Card className="max-w-2xl mx-auto p-12 bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-600 shadow-3xl rounded-[48px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Sparkles size={80} className="text-blue-500" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter font-outfit">{editingFriend ? 'Update Identity' : 'Secure New Profile'}</h3>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <Input
                                        label="Primary Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        required
                                        className="text-lg py-5 px-6 rounded-[24px]"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Phone Link"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91..."
                                            className="py-5 px-6 rounded-[24px]"
                                        />
                                        <Input
                                            label="Email Sync"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="address@domain.com"
                                            className="py-5 px-6 rounded-[24px]"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" size="xl" className="flex-1 rounded-[24px]">Deploy Profile</Button>
                                        <Button type="button" variant="ghost" size="xl" className="flex-1 rounded-[24px] text-slate-400" onClick={() => setIsAdding(false)}>Abort</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {filteredFriends.map((friend, index) => {
                    const stats = getFriendStats(friend.id);
                    return (
                        <motion.div
                            key={friend.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                        >
                            <Card className="p-8 hover:shadow-3xl hover:translate-y-[-8px] transition-all group relative overflow-hidden bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="flex items-center gap-5 mb-8">
                                    <div
                                        className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white text-2xl font-black shadow-2xl group-hover:rotate-6 transition-transform"
                                        style={{ backgroundColor: friend.color }}
                                    >
                                        {friend.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tighter font-outfit">{friend.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest overflow-hidden">
                                            {friend.phone ? <Phone size={10} /> : <Mail size={10} />}
                                            <span className="truncate">{friend.phone || friend.email || 'Stealth Mode'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => startEdit(friend)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center">
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 dark:border-slate-800/50 mb-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-1.5">Contribution</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white font-outfit">₹{stats.totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-1.5">Ops Sync</p>
                                        <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-outfit">{stats.count}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Network Node • {friend.groups?.length || 0} Clusters</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-full px-4 text-slate-400 hover:text-blue-500 font-black text-[10px] uppercase tracking-widest">
                                        Matrix View <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {friends.length === 0 && !isAdding && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[80px] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                            <User size={48} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Network Protocol Empty</h3>
                        <p className="text-slate-400 dark:text-slate-600 font-bold max-w-sm mb-10 text-sm">Synchronize your first contact to begin the distributed expense ledger protocol.</p>
                        <Button variant="blue" size="xl" className="rounded-[32px] px-12" onClick={() => setIsAdding(true)}>Initialize Network</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
