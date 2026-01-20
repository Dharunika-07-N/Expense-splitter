import { useState } from 'react';
import { Coffee, Pizza, Utensils, Film, Car, ShoppingCart, Delete, Plus, Equal, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '../../ui/BaseUI';

const QUICK_AMOUNTS = [
    { label: 'Coffee', emoji: '☕', amount: 50, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Lunch', emoji: '🍕', amount: 150, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    { label: 'Dinner', emoji: '🍽️', amount: 500, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Movie', emoji: '🎬', amount: 350, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Uber', emoji: '🚕', amount: 120, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/30' },
    { label: 'Groceries', emoji: '🛒', amount: 800, color: 'text-green-500 bg-green-50 dark:bg-green-950/30' },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function GamifiedAmountInput({ value, onChange, onCategorySelect, currency = 'INR', onCurrencyChange }) {
    const [inputMode, setInputMode] = useState('quick'); // 'quick' or 'pad'
    const [buffer, setBuffer] = useState(value > 0 ? value.toString() : '');
    const [calcState, setCalcState] = useState({ prev: null, op: null });
    const [shouldReset, setShouldReset] = useState(false);

    const handleQuickAmount = (item) => {
        onChange(item.amount);
        setBuffer(item.amount.toString());
        onCategorySelect?.(item.label);
        setShouldReset(true);
    };

    const handlePadInput = (digit) => {
        let newBuffer;
        if (shouldReset) {
            newBuffer = digit === '.' ? '0.' : digit;
            setShouldReset(false);
        } else {
            if (digit === '.' && buffer.includes('.')) return;
            newBuffer = buffer === '0' && digit !== '.' ? digit : buffer + digit;
        }

        setBuffer(newBuffer);
        onChange(parseFloat(newBuffer) || 0);
    };

    const handleOp = (op) => {
        if (calcState.prev !== null && calcState.op && !shouldReset) {
            const current = parseFloat(buffer);
            let res = calcState.op === '+' ? calcState.prev + current : calcState.prev - current;
            setBuffer(res.toString());
            onChange(res);
            setCalcState({ prev: res, op });
            setShouldReset(true);
        } else if (buffer) {
            setCalcState({ prev: parseFloat(buffer), op });
            setShouldReset(true);
        }
    };

    const handleEqual = () => {
        if (calcState.prev !== null && calcState.op && buffer) {
            const current = parseFloat(buffer);
            let res = calcState.op === '+' ? calcState.prev + current : calcState.prev - current;
            setBuffer(res.toString());
            onChange(res);
            setCalcState({ prev: null, op: null });
            setShouldReset(true);
        }
    };

    const handleAC = () => {
        setBuffer('');
        onChange(0);
        setCalcState({ prev: null, op: null });
        setShouldReset(false);
    };

    const handleBackspace = () => {
        const newBuffer = buffer.slice(0, -1) || '0';
        setBuffer(newBuffer);
        onChange(parseFloat(newBuffer) || 0);
    };

    return (
        <div className="space-y-8">
            {/* Display Area */}
            <Card className="p-10 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-colors"></div>

                <div className="flex justify-between items-center mb-10">
                    <div className="flex gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        {CURRENCIES.map(curr => (
                            <button
                                key={curr}
                                onClick={() => onCurrencyChange?.(curr)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === curr ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-300 dark:text-slate-600'}`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                    <Globe className="text-slate-200 dark:text-slate-800" size={20} />
                </div>

                <div className="text-center relative">
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mb-4">
                        {calcState.op ? `${calcState.prev} ${calcState.op}` : 'Amount Input'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-black text-slate-200 dark:text-slate-800 font-outfit">₹</span>
                        <div className="text-8xl font-black tracking-tighter text-slate-900 dark:text-white font-outfit">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={buffer}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-block"
                                >
                                    {buffer || '0'}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Mode Switcher */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-[32px] mx-auto w-fit">
                {['quick', 'pad'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setInputMode(mode)}
                        className={`px-10 py-4 rounded-[26px] font-black text-[10px] uppercase tracking-widest transition-all ${inputMode === mode ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
                    >
                        {mode === 'quick' ? 'Smart Presets' : 'Logic Pad'}
                    </button>
                ))}
            </div>

            {/* Grid Area */}
            <div className="min-h-[380px]">
                <AnimatePresence mode="wait">
                    {inputMode === 'quick' ? (
                        <motion.div
                            key="quick"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {QUICK_AMOUNTS.map((item) => (
                                <motion.button
                                    key={item.label}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleQuickAmount(item)}
                                    className={`p-6 rounded-[32px] border-2 border-transparent transition-all text-left flex items-center gap-5 ${item.color}`}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black/20 shadow-sm flex items-center justify-center text-3xl">
                                        {item.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-xs uppercase tracking-widest mb-1">{item.label}</div>
                                        <div className="text-[10px] font-black opacity-60">₹{item.amount}</div>
                                    </div>
                                    {Math.abs(parseFloat(buffer) - item.amount) < 0.01 && <Check size={16} className="opacity-40" />}
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pad"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-4 gap-4 px-2"
                        >
                            {[7, 8, 9].map(num => (
                                <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-800 dark:text-white shadow-sm hover:shadow-xl active:bg-slate-50 transition-all font-outfit">
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => handleOp('+')} className="h-20 rounded-3xl bg-blue-600 text-white text-3xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                                <Plus size={32} className="mx-auto" />
                            </button>

                            {[4, 5, 6].map(num => (
                                <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-800 dark:text-white shadow-sm hover:shadow-xl active:bg-slate-50 transition-all font-outfit">
                                    {num}
                                </button>
                            ))}
                            <button onClick={handleBackspace} className="h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 shadow-sm border border-rose-100 dark:border-rose-900 flex items-center justify-center hover:bg-rose-100 transition-all">
                                <Delete size={32} />
                            </button>

                            {[1, 2, 3].map(num => (
                                <button key={num} onClick={() => handlePadInput(num.toString())} className="h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-800 dark:text-white shadow-sm hover:shadow-xl active:bg-slate-50 transition-all font-outfit">
                                    {num}
                                </button>
                            ))}
                            <button onClick={handleEqual} className="h-20 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 flex items-center justify-center hover:bg-indigo-700 transition-all">
                                <Equal size={32} />
                            </button>

                            <button onClick={() => handlePadInput('.')} className="h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-4xl font-black text-slate-800 dark:text-white shadow-sm hover:shadow-xl active:bg-slate-50 transition-all font-outfit">
                                ·
                            </button>
                            <button onClick={() => handlePadInput('0')} className="h-20 col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-800 dark:text-white shadow-sm hover:shadow-xl active:bg-slate-50 transition-all font-outfit">
                                0
                            </button>
                            <button onClick={handleAC} className="h-20 rounded-3xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl">
                                Clear
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
