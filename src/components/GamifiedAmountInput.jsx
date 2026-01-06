import { useState, useEffect } from 'react';
import { Coffee, Pizza, Utensils, Film, Car, ShoppingCart, Delete, Plus, Equal, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_AMOUNTS = [
    { label: 'Coffee', icon: Coffee, amount: 5, emoji: '☕', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Lunch', icon: Pizza, amount: 15, emoji: '🍕', color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Dinner', icon: Utensils, amount: 35, emoji: '🍽️', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Movie', icon: Film, amount: 20, emoji: '🎬', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Uber', icon: Car, amount: 12, emoji: '🚕', color: 'bg-slate-50 text-slate-800 border-slate-100' },
    { label: 'Groceries', icon: ShoppingCart, amount: 50, emoji: '🛒', color: 'bg-green-50 text-green-600 border-green-100' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

export default function GamifiedAmountInput({ value, onChange, onCategorySelect, currency = 'INR', onCurrencyChange }) {
    const [inputMode, setInputMode] = useState('quick'); // 'quick' or 'pad'
    const [buffer, setBuffer] = useState(value > 0 ? value.toString() : '');
    const [calcState, setCalcState] = useState({ prev: null, op: null });
    const [shouldReset, setShouldReset] = useState(false); // New: replace instead of append after quick or operation

    const handleQuickAmount = (item) => {
        onChange(item.amount);
        setBuffer(item.amount.toString());
        onCategorySelect?.(item.label);
        setShouldReset(true); // Next digit will replace this
    };

    const handlePadInput = (digit) => {
        if (digit === '.' && buffer.includes('.')) return;

        let newBuffer;
        if (shouldReset) {
            newBuffer = digit === '.' ? '0.' : digit;
            setShouldReset(false);
        } else {
            newBuffer = buffer === '0' && digit !== '.' ? digit : buffer + digit;
        }

        setBuffer(newBuffer);
        onChange(parseFloat(newBuffer) || 0);
    };

    const handleOp = (op) => {
        if (buffer) {
            setCalcState({ prev: parseFloat(buffer), op });
            setShouldReset(true);
        }
    };

    const handleEqual = () => {
        if (calcState.prev !== null && calcState.op && buffer) {
            const current = parseFloat(buffer);
            let res = 0;
            if (calcState.op === '+') res = calcState.prev + current;
            setBuffer(res.toString());
            onChange(res);
            setCalcState({ prev: null, op: null });
            setShouldReset(true);
        }
    };

    const handleBackspace = () => {
        const newBuffer = buffer.slice(0, -1) || '0';
        setBuffer(newBuffer);
        onChange(parseFloat(newBuffer) || 0);
    };

    const handleAC = () => {
        setBuffer('');
        onChange(0);
        setCalcState({ prev: null, op: null });
        setShouldReset(false);
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-900">
            {/* Currency & Display */}
            <div className="glass rounded-[40px] p-8 relative overflow-hidden shadow-xl ring-1 ring-white/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl">
                        {CURRENCIES.map(curr => (
                            <button
                                key={curr}
                                onClick={() => onCurrencyChange?.(curr)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${currency === curr ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                                    }`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                    <div className="text-slate-300"><Globe size={18} /></div>
                </div>

                <div className="text-center relative py-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                        {calcState.op ? `${calcState.prev} ${calcState.op}` : 'Transaction Amount'}
                    </div>
                    <div className="text-7xl font-black tracking-tighter gradient-text flex items-center justify-center font-outfit">
                        <span className="text-2xl mr-2 opacity-10 font-black">₹</span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={buffer}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-block"
                            >
                                {buffer || '0.00'}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Selector Tabs */}
            <div className="flex p-1.5 bg-slate-100/80 rounded-[28px] mx-4">
                <button
                    onClick={() => setInputMode('quick')}
                    className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${inputMode === 'quick' ? 'bg-white shadow-xl text-blue-600 translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Quick Presets
                </button>
                <button
                    onClick={() => setInputMode('pad')}
                    className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${inputMode === 'pad' ? 'bg-white shadow-xl text-blue-600 translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Calculator
                </button>
            </div>

            <AnimatePresence mode="wait">
                {inputMode === 'quick' ? (
                    <motion.div
                        key="quick"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-2 gap-4 px-2"
                    >
                        {QUICK_AMOUNTS.map((item) => (
                            <motion.button
                                key={item.label}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleQuickAmount(item)}
                                className={`p-5 rounded-[32px] border-2 transition-all text-left flex items-center gap-5 ${item.color} border-transparent shadow-sm`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
                                    {item.emoji}
                                </div>
                                <div>
                                    <div className="font-black text-sm leading-tight uppercase tracking-widest mb-1">{item.label}</div>
                                    <div className="text-xs opacity-60 font-medium">Auto-split ₹{item.amount}</div>
                                </div>
                                {parseFloat(buffer) === item.amount && (
                                    <div className="ml-auto opacity-40"><Check size={16} /></div>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="pad"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-4 gap-3 px-2"
                    >
                        {[7, 8, 9].map(num => (
                            <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-[28px] bg-white border border-slate-100 text-3xl font-black text-slate-800 shadow-sm hover:shadow-md active:bg-slate-50 transition-all font-outfit">
                                {num}
                            </button>
                        ))}
                        <button onClick={() => handleOp('+')} className="h-20 rounded-[28px] bg-blue-500 text-white text-3xl font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
                            <Plus size={32} className="mx-auto" />
                        </button>

                        {[4, 5, 6].map(num => (
                            <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-[28px] bg-white border border-slate-100 text-3xl font-black text-slate-800 shadow-sm hover:shadow-md active:bg-slate-50 transition-all font-outfit">
                                {num}
                            </button>
                        ))}
                        <button onClick={handleBackspace} className="h-20 rounded-[28px] bg-rose-50 text-rose-500 shadow-sm border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-all">
                            <Delete size={32} />
                        </button>

                        {[1, 2, 3].map(num => (
                            <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-[28px] bg-white border border-slate-100 text-3xl font-black text-slate-800 shadow-sm hover:shadow-md active:bg-slate-50 transition-all font-outfit">
                                {num}
                            </button>
                        ))}
                        <button onClick={handleEqual} className="h-20 rounded-[28px] bg-emerald-500 text-white shadow-lg shadow-emerald-100 flex items-center justify-center hover:bg-emerald-600 transition-all">
                            <Equal size={32} />
                        </button>

                        <button onClick={() => handlePadInput('.')} className="h-20 rounded-[28px] bg-white border border-slate-100 text-4xl font-black text-slate-800 shadow-sm hover:shadow-md active:bg-slate-50 transition-all font-outfit">
                            ·
                        </button>
                        <button onClick={() => handlePadInput('0')} className="h-20 col-span-2 rounded-[28px] bg-white border border-slate-100 text-3xl font-black text-slate-800 shadow-sm hover:shadow-md active:bg-slate-50 transition-all font-outfit">
                            0
                        </button>
                        <button onClick={handleAC} className="h-20 rounded-[28px] bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            AC
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
