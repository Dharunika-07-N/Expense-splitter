import { Trash2, TrendingDown, CheckCircle2, IndianRupee, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../../ui/BaseUI';

export default function SettlementView({ settlements, friends, onMarkAsPaid }) {
    const getFriend = (id) => friends.find(f => f.id === id);

    if (settlements.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-xl"
            >
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 size={48} className="animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Perfectly Balanced!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending debts between members.</p>
            </motion.div>
        );
    }

    const handleSettleWhatsApp = (s) => {
        const to = getFriend(s.to)?.name || 'Someone';
        const amount = s.amount.toFixed(2);
        const text = `Hey ${to}! I'm sending ₹${amount} via NexSplit to settle our expenses. 🚀`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
                {settlements.map((s, index) => {
                    const from = getFriend(s.from);
                    const to = getFriend(s.to);

                    return (
                        <motion.div
                            key={`${s.from}-${s.to}-${index}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group relative p-8 hover:shadow-2xl transition-all border-slate-100 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>

                                <div className="absolute top-4 right-8 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-blue-500 font-black text-[8px] uppercase tracking-widest">
                                    NexSplit Optimized
                                </div>

                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:-rotate-6 transition-transform"
                                            style={{ backgroundColor: from?.color }}
                                        >
                                            {from?.avatar}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Debtor</span>
                                            <span className="font-black text-slate-900 dark:text-white text-lg leading-none">{from?.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <TrendingDown className="text-slate-200 dark:text-slate-800 group-hover:text-blue-500 transition-colors mb-2" size={24} />
                                        <div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                    </div>

                                    <div className="flex items-center gap-4 text-right">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1 text-right">Creditor</span>
                                            <span className="font-black text-slate-900 dark:text-white text-lg leading-none text-right">{to?.name}</span>
                                        </div>
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:rotate-6 transition-transform"
                                            style={{ backgroundColor: to?.color }}
                                        >
                                            {to?.avatar}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        <span className="text-xl opacity-20 mr-1">₹</span>{s.amount.toLocaleString()}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleSettleWhatsApp(s)}
                                            className="p-4 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all"
                                            title="Remind via WhatsApp"
                                        >
                                            <ExternalLink size={20} />
                                        </Button>
                                        <Button
                                            variant="blue"
                                            size="md"
                                            onClick={() => onMarkAsPaid(s)}
                                            className="rounded-2xl shadow-xl shadow-blue-500/20"
                                        >
                                            <IndianRupee size={16} /> Record Payment
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
