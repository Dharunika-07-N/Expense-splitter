import { Trash2, Calendar, Tag, User, Scale, Search, Filter, PieChart, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseList({ expenses, friends, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showStats, setShowStats] = useState(false);

    const getPayerName = (id) => friends.find(f => f.id === id)?.name || 'Unknown';

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e =>
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getPayerName(e.payer).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [expenses, searchTerm, friends]);

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
            <div className="text-center py-24 bg-white rounded-[48px] border border-dashed border-slate-200">
                <div className="text-6xl mb-4 opacity-20">📜</div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Awaiting your first transaction</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search & Stats Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 px-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="pl-16 pr-6 py-6 bg-white border border-slate-100 rounded-[32px] w-full shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                    />
                </div>
                <button
                    onClick={() => setShowStats(!showStats)}
                    className={`px-8 py-6 rounded-[32px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${showStats ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-slate-100 text-slate-600 shadow-sm hover:shadow-md'}`}
                >
                    <PieChart size={18} />
                    Insights Center
                </button>
            </div>

            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-2 overflow-hidden"
                    >
                        <div className="p-10 bg-slate-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-full w-1/3 bg-blue-500/10 blur-3xl"></div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Asset Allocation by Category</h4>
                            <div className="space-y-6">
                                {categoryStats.map(([cat, amt]) => {
                                    const pct = (amt / expenses.reduce((s, e) => s + e.amount, 0)) * 100;
                                    return (
                                        <div key={cat} className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-black flex items-center gap-3">
                                                    <span className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">{getEmojiForCategory(cat)}</span>
                                                    {cat}
                                                </span>
                                                <span className="font-black text-blue-400 text-lg">₹{amt.toFixed(2)}</span>
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4 px-2">
                <AnimatePresence initial={false}>
                    {filteredExpenses.slice().reverse().map((exp) => (
                        <motion.div
                            layout
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group p-6 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-500/20 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                                    {getEmojiForCategory(exp.category)}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 flex items-center gap-3 text-xl tracking-tighter">
                                        {exp.description}
                                        <div className="flex gap-1">
                                            {exp.splitMode !== 'equal' && (
                                                <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg" title="Advanced Split">
                                                    <Scale size={14} />
                                                </div>
                                            )}
                                            {exp.isRecurring && (
                                                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg animate-spin-slow" title="Recurring Bill">
                                                    <RefreshCw size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-4 mt-1.5">
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                                            <User size={12} className="text-blue-500" /> {getPayerName(exp.payer)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-slate-200" /> {new Date(exp.date).toLocaleDateString()}
                                        </span>
                                        {exp.category && (
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg">#{exp.category.toLowerCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter font-outfit">
                                        <span className="text-lg opacity-10 mr-1">₹</span>{exp.amount.toFixed(2)}
                                    </div>
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right mt-1">
                                        {exp.splitAmong.length} Particpants
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDelete(exp.id)}
                                    className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all group-hover:border-rose-100"
                                    title="Delete Securely"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredExpenses.length === 0 && (
                <div className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest">
                    Zero transactions found for your criteria.
                </div>
            )}
        </div>
    );
}

function getEmojiForCategory(category) {
    const map = {
        'Coffee': '☕',
        'Lunch': '🍕',
        'Dinner': '🍽️',
        'Movie': '🎬',
        'Uber': '🚕',
        'Groceries': '🛒',
    };
    return map[category] || '💰';
}
