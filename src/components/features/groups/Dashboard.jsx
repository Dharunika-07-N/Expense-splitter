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
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Your Groups</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Manage all your shared expenses</p>
                </div>
                <Button onClick={() => setIsAdding(true)} variant="blue" size="lg" className="shadow-xl shadow-blue-500/20">
                    <Plus size={20} />
                    New Group
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none p-8">
                    <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Active Groups</p>
                    <h3 className="text-5xl font-black">{groups.length}</h3>
                </Card>
                <Card className="bg-slate-900 dark:bg-slate-800 text-white border-none p-8">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Transactions</p>
                    <h3 className="text-5xl font-black">{expenses.length}</h3>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">NexSplit Health</p>
                    <h3 className="text-5xl font-black text-blue-600">Pure</h3>
                </Card>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <Card className="border-2 border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 h-full p-8">
                                <form onSubmit={handleAddGroup} className="space-y-6">
                                    <div className="space-y-4">
                                        <input
                                            autoFocus
                                            placeholder="Group Name (e.g. Goa Trip)"
                                            className="w-full bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none ring-4 ring-transparent focus:ring-blue-500/20 transition-all shadow-sm"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {['trip', 'home', 'event', 'roommates', 'other'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setNewGroupType(t)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newGroupType === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" className="flex-1" size="md">Create</Button>
                                        <Button type="button" variant="ghost" className="flex-1" size="md" onClick={() => setIsAdding(false)}>Cancel</Button>
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                className="group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-2xl transition-all relative overflow-hidden dark:bg-slate-900/50 p-8 h-full flex flex-col"
                                onClick={() => onSelectGroup(group.id)}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -mr-16 -mt-16 bg-blue-600 rounded-full"></div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                                        {group.type === 'trip' ? <Calendar size={28} /> :
                                            group.type === 'home' ? <LayoutGrid size={28} /> :
                                                <Users size={28} />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 group-hover:text-blue-300 transition-colors">{group.type}</span>
                                </div>

                                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h4>

                                <div className="flex items-center gap-4 mb-10">
                                    <div className="flex -space-x-2">
                                        {group.memberIds.slice(0, 3).map((mid, i) => (
                                            <div key={mid} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                {i + 1}
                                            </div>
                                        ))}
                                        {group.memberIds.length > 3 && (
                                            <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                +{group.memberIds.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-600">{group.memberIds.length} members</span>
                                </div>

                                <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800 pt-6 mt-auto">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-2">Total Combined Spend</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit">₹{stats.total.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">
                                        Enter <ArrowRight size={16} />
                                    </div>
                                </div>

                                {/* Context Actions (Subtle) */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure?')) deleteGroup(group.id); }}
                                        className="p-3 text-slate-200 dark:text-slate-800 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {groups.length === 0 && !isAdding && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-slate-800 transform -rotate-12">
                            <LayoutGrid size={48} />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Start your first journey</h3>
                            <p className="text-slate-400 dark:text-slate-600 font-bold text-sm mt-2">Group expenses, shared memories, zero effort.</p>
                        </div>
                        <Button onClick={() => setIsAdding(true)} variant="blue" size="xl" className="shadow-2xl shadow-blue-500/20">
                            Create First Group
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

