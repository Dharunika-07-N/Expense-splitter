import { useState } from 'react';
import { IndianRupee, User, ArrowRight, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebtCalculator({ friends, onAddSettlement }) {
    const [amount, setAmount] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step === 1 && amount > 0) setStep(2);
    };

    const handleSettle = () => {
        if (amount > 0 && selectedFriend) {
            onAddSettlement?.({
                amount: parseFloat(amount),
                to: selectedFriend.id,
                date: new Date().toISOString()
            });
            // Reset
            setAmount('');
            setSelectedFriend(null);
            setStep(1);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Quick <span className="text-blue-600">Settle</span></h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-8">Calculate or record a direct payment to a friend</p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="glass rounded-[40px] p-10 relative overflow-hidden shadow-2xl border border-white">
                            <div className="text-center relative py-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">How much are you sending?</span>
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-4xl font-black text-blue-600 opacity-20">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-transparent text-7xl font-black tracking-tighter text-slate-900 w-full max-w-[250px] outline-none text-center font-outfit"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!amount || amount <= 0}
                            onClick={handleNext}
                            className={`w-full py-6 rounded-[32px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${amount > 0 ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 hover:bg-blue-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                        >
                            Next: Choose Recipient <ArrowRight size={24} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between px-4">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-widest">← Back</button>
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                                <IndianRupee size={14} className="text-blue-600" />
                                <span className="text-sm font-black text-blue-600">₹{parseFloat(amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {friends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${selectedFriend?.id === friend.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 shadow-sm'}`}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner bg-white/10"
                                        style={{ backgroundColor: selectedFriend?.id === friend.id ? 'rgba(255,255,255,0.2)' : friend.color }}
                                    >
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-black text-xs uppercase tracking-widest truncate w-full text-center">{friend.name}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={!selectedFriend}
                            onClick={handleSettle}
                            className={`w-full py-6 rounded-[32px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${selectedFriend ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-100 hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                        >
                            Record Payment <Send size={24} />
                        </button>

                        <div className="flex items-center justify-center gap-2 text-slate-300">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Updates group balances instantly</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
