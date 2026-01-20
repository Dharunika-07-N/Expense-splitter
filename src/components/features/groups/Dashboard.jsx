import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ReceiptText, LayoutGrid, Calendar, ArrowRight, Settings, Trash2, Archive } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Button, Card } from '../../ui/BaseUI';
import { createGroup } from '../../../utils/storage';

export default function Dashboard({ onSelectGroup }) {
    const { groups, expenses, addGroup, deleteGroup, updateGroup } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState('trip');

    const handleAddGroup = (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        const group = createGroup(newGroupName, newGroupType);
        addGroup(group);
        setNewGroupName('');
        setIsAdding(false);
    };

    const getGroupStats = (groupId) => {
        const groupExpenses = expenses.filter(e => e.groupId === groupId);
        const total = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
        return { total, count: groupExpenses.length };
    };

    return (
        <div className="space-y-10">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Groups</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Manage all your shared expenses</p>
                </div>
                <Button onClick={() => setIsAdding(true)} variant="blue" size="lg">
                    <Plus size={20} />
                    New Group
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                    <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Active Groups</p>
                    <h3 className="text-5xl font-black">{groups.length}</h3>
                </Card>
                <Card className="bg-slate-900 text-white border-none">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Transactions</p>
                    <h3 className="text-5xl font-black">{expenses.length}</h3>
                </Card>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 h-full">
                                <form onSubmit={handleAddGroup} className="space-y-4">
                                    <input
                                        autoFocus
                                        placeholder="Group Name (e.g. Goa Trip)"
                                        className="w-full bg-white px-4 py-3 rounded-xl font-bold text-slate-900 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {['trip', 'home', 'event', 'roommates', 'other'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setNewGroupType(t)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newGroupType === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" className="flex-1" size="sm">Create</Button>
                                        <Button type="button" variant="ghost" className="flex-1" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {groups.map((group) => {
                    const stats = getGroupStats(group.id);
                    return (
                        <motion.div
                            key={group.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Card
                                className="group cursor-pointer hover:border-blue-200 hover:shadow-2xl transition-all relative overflow-hidden"
                                onClick={() => onSelectGroup(group.id)}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-16 -mt-16 bg-current rounded-full" style={{ color: group.coverImage.match(/#[0-9a-f]{6}/i)?.[0] || '#000' }}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {group.type === 'trip' ? <Calendar size={24} /> :
                                            group.type === 'home' ? <LayoutGrid size={24} /> :
                                                <Users size={24} />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-200">{group.type}</span>
                                </div>

                                <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{group.name}</h4>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{group.memberIds.length} members</span>
                                </div>

                                <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-auto">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Total Spent</p>
                                        <p className="text-lg font-black text-slate-900">₹{stats.total.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                        View <ArrowRight size={14} />
                                    </div>
                                </div>

                                {/* Context Actions (Subtle) */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {groups.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <LayoutGrid size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">No groups yet</h3>
                            <p className="text-slate-400 font-medium">Create your first group to start splitting bills!</p>
                        </div>
                        <Button onClick={() => setIsAdding(true)} variant="secondary">
                            Get Started
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
