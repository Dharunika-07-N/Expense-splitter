import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Hash, History, Receipt, Wallet, Trash2, Edit2, ChevronDown, Calendar, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card, Button } from '../../ui/BaseUI';
import { format } from 'date-fns';

export default function ActivityHistory() {
    const { activities, groups, friends, deleteExpense } = useApp();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch =
                activity.details?.description?.toLowerCase().includes(search.toLowerCase()) ||
                activity.type.toLowerCase().includes(search.toLowerCase());

            const matchesType = filterType === 'all' || activity.type.startsWith(filterType);

            return matchesSearch && matchesType;
        });
    }, [activities, search, filterType]);

    const getIcon = (type) => {
        switch (type) {
            case 'expense_added': return <Receipt className="text-blue-500" />;
            case 'expense_edited': return <Edit2 className="text-amber-500" />;
            case 'expense_deleted': return <Trash2 className="text-rose-500" />;
            case 'settlement_added': return <Wallet className="text-emerald-500" />;
            case 'group_created': return <Hash className="text-indigo-500" />;
            default: return <History className="text-slate-400" />;
        }
    };

    const getGroupName = (groupId) => {
        return groups.find(g => g.id === groupId)?.name || 'Unknown Group';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Activity Log</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Timeline of all transactions and changes</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search activity..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'expense', 'settlement', 'group'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Timeline */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredActivities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-5 flex items-center gap-6 hover:shadow-xl transition-all group">
                                <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-slate-900">
                                            {activity.type.replace('_', ' ').toUpperCase()}
                                        </h4>
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                            {getGroupName(activity.groupId)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">
                                        {activity.details?.description ? (
                                            <>
                                                {activity.details.description}
                                                {activity.details.amount && <span className="text-slate-900 ml-2">₹{activity.details.amount.toLocaleString()}</span>}
                                            </>
                                        ) : (
                                            `System action performed by the user`
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Time</p>
                                    <p className="text-xs font-bold text-slate-500">
                                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                                    </p>
                                </div>

                                {/* Quick Undo/Action if applicable */}
                                <div className="hidden group-hover:flex items-center gap-2 pl-4 border-l border-slate-100">
                                    <button
                                        onClick={() => console.log('View details for', activity.entityId)}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="View Details"
                                    >
                                        <ArrowRightLeft size={18} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredActivities.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <History size={48} className="text-slate-100 mb-4" />
                        <h3 className="text-xl font-black text-slate-400">No activities found</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
