import { Trash2, Calendar, User, Scale, Search, PieChart, RefreshCw } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../../ui/BaseUI';

export default function ExpenseList({ expenses, friends, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showStats, setShowStats] = useState(false);

    const getPayerName = useCallback((id) => friends.find(f => f.id === id)?.name || 'Unknown', [friends]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e =>
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getPayerName(e.payer).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [expenses, searchTerm, getPayerName]);

    const categoryStats = useMemo(() => {
        const stats = {};
        expenses.forEach(e => {
            const cat = e.category || 'Other';
            stats[cat] = (stats[cat] || 0) + e.amount;
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [expenses]);

    if (expenses.length === 0) {
        return (
            <div className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800">
                <div className="text-6xl mb-4 opacity-20">📜</div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Awaiting your first transaction</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search & Stats Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 px-2">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="pl-16 pr-6 py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] w-full shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 dark:text-white"
                    />
                </div>
                <Button
                    variant={showStats ? 'blue' : 'secondary'}
                    size="xl"
                    onClick={() => setShowStats(!showStats)}
                    className="rounded-[32px] px-10"
                >
                    <PieChart size={18} />
                    Insights
                </Button>
            </div>

            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-2 overflow-hidden"
                    >
                        <Card className="p-10 bg-slate-900 dark:bg-slate-950 text-white shadow-2xl relative overflow-hidden border-none">
                            <div className="absolute top-0 right-0 h-full w-1/3 bg-blue-500/10 blur-3xl"></div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Allocation by Category</h4>
                            <div className="space-y-6">
                                {categoryStats.map(([cat, amt]) => {
                                    const total = expenses.reduce((s, e) => s + e.amount, 0);
                                    const pct = total > 0 ? (amt / total) * 100 : 0;
                                    return (
                                        <div key={cat} className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-black flex items-center gap-3 text-slate-300">
                                                    <span className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">{getEmojiForCategory(cat)}</span>
                                                    {cat}
                                                </span>
                                                <span className="font-black text-blue-400 text-lg">₹{amt.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4 px-2">
                <AnimatePresence initial={false}>
                    {filteredExpenses.slice().reverse().map((exp) => (
                        <motion.div
                            layout
                            key={exp.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group p-6 bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-500/20 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                                    {getEmojiForCategory(exp.category)}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xl tracking-tighter">
                                        {exp.description}
                                        <div className="flex gap-1">
                                            {exp.splitMode !== 'equal' && (
                                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg" title="Advanced Split">
                                                    <Scale size={14} />
                                                </div>
                                            )}
                                            {exp.isRecurring && (
                                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg" title="Recurring Bill">
                                                    <RefreshCw size={14} className="animate-spin-slow" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-4 mt-1.5">
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <User size={12} className="text-blue-500" /> {getPayerName(exp.payer)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-slate-300 dark:text-slate-600" /> {new Date(exp.date).toLocaleDateString()}
                                        </span>
                                        {exp.category && (
                                            <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 rounded-lg">#{exp.category.toLowerCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit">
                                        <span className="text-lg opacity-10 dark:opacity-20 mr-1">₹</span>{exp.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest text-right mt-1">
                                        {exp.splitAmong.length} Participants
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(exp.id)}
                                    className="p-4 text-slate-200 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-[20px] transition-all"
                                >
                                    <Trash2 size={24} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function getEmojiForCategory(category) {
    const map = {
        'Coffee': '☕',
        'Lunch': '🍕',
        'Dinner': '🍽️',
        'Movie': '🎬',
        'Transportation': '🚕',
        'Groceries': '🛒',
        'Shopping': '🛍️',
        'Rent': '🏠',
        'Bills': '📄',
        'Entertainment': '🎮',
        'Travel': '✈️',
        'Other': '💰'
    };
    return map[category] || map['Other'];
}
