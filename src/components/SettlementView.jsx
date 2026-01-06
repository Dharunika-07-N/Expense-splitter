import { ArrowRight, User, TrendingDown, CheckCircle2, IndianRupee, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettlementView({ settlements, friends, onMarkAsPaid }) {
    const getFriend = (id) => friends.find(f => f.id === id);

    if (settlements.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[48px] p-16 text-center shadow-xl border border-white"
            >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 size={48} className="animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">All Settled Up!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending debts to simplify.</p>
            </motion.div>
        );
    }

    const handleSettleWhatsApp = (s) => {
        const from = getFriend(s.from)?.name || 'Someone';
        const to = getFriend(s.to)?.name || 'Someone';
        const amount = s.amount.toFixed(2);
        const text = `Hey ${to}! I'm sending ₹${amount} via NexSplit to settle our expenses. 🚀`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleSettleNow = (settlement) => {
        const from = getFriend(settlement.from);
        const to = getFriend(settlement.to);

        if (confirm(`Mark ₹${settlement.amount.toFixed(2)} payment from ${from?.name} to ${to?.name} as settled?`)) {
            onMarkAsPaid?.(settlement);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlements.map((s, index) => {
                const from = getFriend(s.from);
                const to = getFriend(s.to);

                return (
                    <motion.div
                        key={`${s.from}-${s.to}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col justify-between overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                    style={{ backgroundColor: from?.color }}
                                >
                                    {from?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Debtor</span>
                                    <span className="font-black text-slate-800 text-lg leading-none">{from?.name}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <TrendingDown className="text-blue-200 group-hover:text-blue-500 transition-colors mb-2" size={24} />
                                <div className="h-0.5 w-12 bg-slate-100 rounded-full"></div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1 text-right">Creditor</span>
                                    <span className="font-black text-slate-800 text-lg leading-none">{to?.name}</span>
                                </div>
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                    style={{ backgroundColor: to?.color }}
                                >
                                    {to?.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                <span className="text-xl opacity-20 mr-1">₹</span>{s.amount.toFixed(2)}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSettleWhatsApp(s)}
                                    className="p-4 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 rounded-3xl transition-all"
                                    title="Send via WhatsApp"
                                >
                                    <ExternalLink size={20} />
                                </button>
                                <button
                                    onClick={() => handleSettleNow(s)}
                                    className="px-6 py-4 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
                                >
                                    <IndianRupee size={14} /> Settle Now
                                </button>
                            </div>
                        </div>

                        {/* Micro-label */}
                        <div className="absolute top-4 right-8 bg-blue-50 px-3 py-1 rounded-full text-blue-500 font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            AI Suggested
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
