import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, History, Receipt, Wallet, Trash2, Edit2, Calendar, ArrowRightLeft, Clock } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { Card } from '../../ui/BaseUI';
import { format } from 'date-fns';

export default function ActivityHistory() {
    const { activities, groups } = useApp();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredActivities = useMemo(() => {
        return [...activities].reverse().filter(activity => {
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
        return groups.find(g => g.id === groupId)?.name || 'Global Context';
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="absolute top-[-200%] left-[-10%] w-[30%] h-[500%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl">
                            <Clock className="text-white dark:text-slate-900" size={24} />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit">Timeline</h2>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] ml-15">Audit trail of all operations</p>
                </div>
            </div>

            {/* Control Hub */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors" size={20} />
                    <input
                        placeholder="Search mutations..."
                        className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900/50 rounded-[28px] font-bold text-slate-900 dark:text-white outline-none shadow-sm border border-slate-100 dark:border-slate-800/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-outfit"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-[30px]">
                    {['all', 'expense', 'settlement'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Infinite Timeline */}
            <div className="space-y-6 relative">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800/50 hidden md:block"></div>

                <AnimatePresence mode="popLayout">
                    {filteredActivities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="p-8 flex items-center gap-8 hover:shadow-2xl hover:translate-x-2 transition-all group relative bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="hidden md:flex absolute left-[-45px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 z-10"></div>

                                <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                    {getIcon(activity.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-3 mb-2">
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">
                                            {activity.type.replace('_', ' ')}
                                        </h4>
                                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black text-[8px] uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                                            {getGroupName(activity.groupId)}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-outfit truncate">
                                            {activity.details?.description || 'System Protocol Executed'}
                                        </p>
                                        {activity.details?.amount && (
                                            <span className="text-2xl font-black text-slate-400 dark:text-slate-600 font-outfit">₹{activity.details.amount.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right hidden sm:block">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-slate-300 dark:text-slate-700 mb-1">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(activity.timestamp), 'MMM d')}</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-slate-400 font-outfit">
                                            {format(new Date(activity.timestamp), 'h:mm a')}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden group-hover:flex items-center gap-2 pl-6 border-l border-slate-100 dark:border-slate-800/50">
                                    <button
                                        className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-all flex items-center justify-center"
                                        title="Inspect Mutation"
                                    >
                                        <ArrowRightLeft size={18} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredActivities.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[80px] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                            <History size={48} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Null Activity Matrix</h3>
                        <p className="text-slate-400 dark:text-slate-600 font-bold max-w-sm text-sm">No recorded transactions detected in the current filter context.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
