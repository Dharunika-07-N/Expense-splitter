import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, Phone, Mail, Edit2, Trash2, ChevronRight, Filter } from 'lucide-react';
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Friends</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Manage your contacts and their activity</p>
                </div>
                <Button onClick={() => { setIsAdding(true); setEditingFriend(null); setFormData({ name: '', phone: '', email: '' }); }} variant="blue">
                    <Plus size={20} />
                    Add Friend
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search by name or phone..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl font-bold text-slate-900 outline-none shadow-sm border border-slate-100 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="col-span-full"
                        >
                            <Card className="max-w-xl mx-auto border-2 border-blue-500">
                                <h3 className="text-xl font-black mb-6">{editingFriend ? 'Edit Friend' : 'New Friend'}</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Phone (Optional)"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 9876543210"
                                        />
                                        <Input
                                            label="Email (Optional)"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="flex-1">Save Friend</Button>
                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {filteredFriends.map(friend => {
                    const stats = getFriendStats(friend.id);
                    return (
                        <motion.div key={friend.id} layout>
                            <Card className="hover:shadow-2xl transition-all group overflow-hidden">
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                                        style={{ backgroundColor: friend.color }}
                                    >
                                        {friend.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black text-slate-900 truncate">{friend.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {friend.phone || friend.email || 'No contact info'}
                                        </p>
                                    </div>
                                    <button onClick={() => startEdit(friend)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="text-sm font-black text-slate-900">₹{stats.totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Activities</p>
                                        <p className="text-sm font-black text-slate-900 text-right">{stats.count}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">In {friend.groups?.length || 0} Groups</span>
                                    <Button variant="ghost" size="sm" className="px-0 group-hover:px-4 transition-all overflow-hidden">
                                        History <ChevronRight size={14} />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {friends.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <User size={48} className="text-slate-200 mb-4" />
                        <h3 className="text-xl font-black text-slate-900">Your friend list is empty</h3>
                        <p className="text-slate-400 mb-6">Add friends to start sharing expenses with them.</p>
                        <Button variant="secondary" onClick={() => setIsAdding(true)}>Add your first friend</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
