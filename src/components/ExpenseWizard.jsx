import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Scale, Percent, Divide, List, Plus, Trash2, Camera, RefreshCw } from 'lucide-react';
import SmartFriendSelector from './SmartFriendSelector';
import GamifiedAmountInput from './GamifiedAmountInput';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseWizard({ friends, onComplete, onAddFriend }) {
    const [step, setStep] = useState(1);
    const [expenseData, setExpenseData] = useState({
        description: '',
        category: '',
        amount: 0,
        payer: '',
        splitAmong: [],
        splitMode: 'equal', // 'equal', 'unequal', 'percentage', 'itemized'
        splits: {}, // { friendId: amount }
        items: [], // [ { id, name, amount, participants: [] } ]
        isRecurring: false
    });

    const [validationError, setValidationError] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Sync splits based on splitMode
    useEffect(() => {
        if (expenseData.amount <= 0) return;

        if (expenseData.splitMode === 'equal' && expenseData.splitAmong.length > 0) {
            const perPerson = expenseData.amount / expenseData.splitAmong.length;
            const newSplits = {};
            expenseData.splitAmong.forEach(id => { newSplits[id] = perPerson; });
            setExpenseData(prev => ({ ...prev, splits: newSplits }));
        } else if (expenseData.splitMode === 'itemized') {
            const newSplits = {};
            expenseData.splitAmong.forEach(id => { newSplits[id] = 0; });
            expenseData.items.forEach(item => {
                if (item.participants.length > 0) {
                    const share = item.amount / item.participants.length;
                    item.participants.forEach(pid => {
                        newSplits[pid] = (newSplits[pid] || 0) + share;
                    });
                }
            });
            // Any remaining amount not itemized? Maybe distribute or leave as gap
            setExpenseData(prev => ({ ...prev, splits: newSplits }));
        }
    }, [expenseData.amount, expenseData.splitAmong, expenseData.splitMode, expenseData.items]);

    const handleNext = () => {
        const error = getValidationError();
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setValidationError('');
        setStep(step - 1);
    };

    const handleComplete = () => {
        const error = getValidationError();
        if (error) {
            setValidationError(error);
            return;
        }
        onComplete(expenseData);
        setStep(1);
        setExpenseData({
            description: '',
            category: '',
            amount: 0,
            payer: '',
            splitAmong: [],
            splitMode: 'equal',
            splits: {},
            items: [],
            isRecurring: false
        });
    };

    const getValidationError = () => {
        switch (step) {
            case 1:
                if (expenseData.amount <= 0) return 'Please enter an amount greater than 0.';
                break;
            case 2:
                if (expenseData.description.trim() === '') return 'Please enter a description.';
                break;
            case 3:
                if (expenseData.splitAmong.length === 0) return 'Please select at least one person.';

                if (expenseData.splitMode === 'unequal') {
                    const total = Object.values(expenseData.splits).reduce((a, b) => a + b, 0);
                    if (Math.abs(total - expenseData.amount) > 0.05) {
                        return `Total (${total.toFixed(2)}) must match expense amount (${expenseData.amount.toFixed(2)}).`;
                    }
                }

                if (expenseData.splitMode === 'percentage') {
                    const pctSum = Object.values(expenseData.splits).map(v => (v / expenseData.amount * 100)).reduce((a, b) => a + b, 0);
                    if (Math.abs(pctSum - 100) > 0.1) {
                        return `Percentages must sum to 100%. Current: ${pctSum.toFixed(1)}%`;
                    }
                }

                if (expenseData.splitMode === 'itemized') {
                    const itemTotal = expenseData.items.reduce((s, i) => s + i.amount, 0);
                    if (Math.abs(itemTotal - expenseData.amount) > 0.05) {
                        return `Item total (${itemTotal.toFixed(2)}) must match total amount (${expenseData.amount.toFixed(2)}).`;
                    }
                }
                break;
            case 4:
                if (expenseData.payer === '') return 'Please select who paid.';
                break;
        }
        return '';
    };

    const addItem = () => {
        setExpenseData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), name: '', amount: 0, participants: [] }]
        }));
    };

    const updateItem = (id, field, value) => {
        setExpenseData(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
        }));
    };

    const toggleItemParticipant = (itemId, friendId) => {
        setExpenseData(prev => ({
            ...prev,
            items: prev.items.map(i => {
                if (i.id === itemId) {
                    const p = i.participants.includes(friendId)
                        ? i.participants.filter(id => id !== friendId)
                        : [...i.participants, friendId];
                    return { ...i, participants: p };
                }
                return i;
            })
        }));
    };

    const simulateOCR = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setExpenseData(prev => ({
                ...prev,
                splitMode: 'itemized',
                items: [
                    { id: 101, name: 'Burger', amount: 35.50, participants: [] },
                    { id: 102, name: 'Large Fries', amount: 12.00, participants: [] },
                    { id: 103, name: 'Coke', amount: 4.50, participants: [] }
                ],
                amount: 52.00
            }));
        }, 2000);
    };

    const canProceed = () => {
        switch (step) {
            case 1: return expenseData.amount > 0;
            case 2: return expenseData.description.trim() !== '';
            case 3: return expenseData.splitAmong.length > 0;
            case 4: return expenseData.payer !== '';
            default: return true;
        }
    };

    const updateCustomSplit = (friendId, value, mode) => {
        const newSplits = { ...expenseData.splits };
        if (mode === 'unequal') {
            newSplits[friendId] = parseFloat(value) || 0;
        } else if (mode === 'percentage') {
            const pct = parseFloat(value) || 0;
            newSplits[friendId] = (pct / 100) * expenseData.amount;
        }
        setExpenseData(prev => ({ ...prev, splits: newSplits }));
    };

    const progress = (step / 4) * 100;

    const steps = [
        { id: 1, title: 'How much?', subtitle: 'Enter the total amount' },
        { id: 2, title: 'What for?', subtitle: 'Give it a name' },
        { id: 3, title: 'Split Engine', subtitle: 'How should the math work?' },
        { id: 4, title: 'Finalize', subtitle: 'Payer & Subscriptions' },
    ];

    return (
        <div className="max-w-xl mx-auto">
            {/* Header Info */}
            <div className="mb-10 text-center relative">
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 font-outfit">
                    {steps[step - 1].title}
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{steps[step - 1].subtitle}</p>

                {/* Progress Tracker Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
                    ))}
                </div>
            </div>

            {/* Validation Message */}
            <AnimatePresence>
                {validationError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black uppercase tracking-wider flex items-center gap-3"
                    >
                        <div className="w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center">!</div>
                        {validationError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="min-h-[480px] mb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        {step === 1 && (
                            <GamifiedAmountInput
                                value={expenseData.amount}
                                onChange={(amount) => setExpenseData({ ...expenseData, amount })}
                                onCategorySelect={(category) => setExpenseData({ ...expenseData, category })}
                            />
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="p-12 glass rounded-[48px] text-center shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">📝</div>
                                    <input
                                        type="text"
                                        value={expenseData.description}
                                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                        placeholder="Weekend Trip..."
                                        className="w-full text-4xl font-black bg-transparent border-none text-center focus:ring-0 outline-none text-slate-900 placeholder:text-slate-200 font-outfit"
                                        autoFocus
                                    />
                                    <div className="h-1 w-1/3 mx-auto bg-slate-100 mt-6 rounded-full group-hover:w-1/2 transition-all"></div>

                                    <button
                                        onClick={simulateOCR}
                                        disabled={isScanning}
                                        className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center gap-3 mx-auto shadow-xl"
                                    >
                                        {isScanning ? (
                                            <> <RefreshCw size={16} className="animate-spin" /> Analyzing Receipt... </>
                                        ) : (
                                            <> <Camera size={16} /> Scan Bill (OCR) </>
                                        )}
                                    </button>
                                </div>
                                {expenseData.category && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex justify-center"
                                    >
                                        <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                                            <Sparkles size={14} /> Auto-Categorized: {expenseData.category}
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <SmartFriendSelector
                                    friends={friends}
                                    selected={expenseData.splitAmong}
                                    onSelect={(friendId) => {
                                        const newSplit = expenseData.splitAmong.includes(friendId)
                                            ? expenseData.splitAmong.filter(id => id !== friendId)
                                            : [...expenseData.splitAmong, friendId];
                                        setExpenseData({ ...expenseData, splitAmong: newSplit });
                                    }}
                                    onAddFriend={onAddFriend}
                                />

                                {expenseData.splitAmong.length > 0 && (
                                    <div className="mt-10 pt-10 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 px-2">Split Algorithm</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-[28px] mb-8">
                                            {[
                                                { id: 'equal', icon: Divide, label: 'Equal' },
                                                { id: 'unequal', icon: Scale, label: 'Exact' },
                                                { id: 'percentage', icon: Percent, label: '%' },
                                                { id: 'itemized', icon: List, label: 'Tab' },
                                            ].map(mode => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setExpenseData(prev => ({ ...prev, splitMode: mode.id }))}
                                                    className={`py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${expenseData.splitMode === mode.id ? 'bg-white shadow-xl text-blue-600 scale-[1.05]' : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    <mode.icon size={16} />
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Itemized / Tab Split UI */}
                                        {expenseData.splitMode === 'itemized' && (
                                            <div className="space-y-4">
                                                {expenseData.items.map(item => (
                                                    <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex gap-4 mb-4">
                                                            <input
                                                                placeholder="Item name"
                                                                className="flex-1 font-bold text-slate-800 border-none bg-slate-50 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500"
                                                                value={item.name}
                                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Price"
                                                                className="w-24 font-black text-blue-600 text-right border-none bg-blue-50 rounded-xl px-4 py-2"
                                                                value={item.amount || ''}
                                                                onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                                            />
                                                            <button
                                                                onClick={() => setExpenseData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== item.id) }))}
                                                                className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {expenseData.splitAmong.map(fid => {
                                                                const friend = friends.find(f => f.id === fid);
                                                                const isActive = item.participants.includes(fid);
                                                                return (
                                                                    <button
                                                                        key={fid}
                                                                        onClick={() => toggleItemParticipant(item.id, fid)}
                                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isActive
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                                            }`}
                                                                    >
                                                                        {friend?.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={addItem}
                                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Add New Item
                                                </button>
                                            </div>
                                        )}

                                        {/* Manual Unequal / Percent Split Inputs */}
                                        {(expenseData.splitMode === 'unequal' || expenseData.splitMode === 'percentage') && (
                                            <div className="space-y-2">
                                                {expenseData.splitAmong.map(fid => {
                                                    const friend = friends.find(f => f.id === fid);
                                                    return (
                                                        <div key={fid} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                                            <span className="font-black text-slate-700 text-xs uppercase tracking-widest">{friend?.name}</span>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    className="w-24 text-right p-3 bg-slate-50 border-none rounded-2xl font-black text-blue-600 focus:ring-1 focus:ring-blue-500"
                                                                    value={expenseData.splitMode === 'percentage'
                                                                        ? (((expenseData.splits[fid] || 0) / expenseData.amount) * 100).toFixed(0)
                                                                        : (expenseData.splits[fid] || '').toString()
                                                                    }
                                                                    onChange={(e) => updateCustomSplit(fid, e.target.value, expenseData.splitMode)}
                                                                />
                                                                <span className="text-slate-200 font-black">
                                                                    {expenseData.splitMode === 'percentage' ? '%' : '$'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 text-slate-900">
                                <div className="grid grid-cols-2 gap-3">
                                    {friends
                                        .filter(f => expenseData.splitAmong.includes(f.id))
                                        .map(f => (
                                            <motion.button
                                                key={f.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setExpenseData({ ...expenseData, payer: f.id })}
                                                className={`p-6 rounded-[32px] border-2 transition-all text-left relative overflow-hidden ${expenseData.payer === f.id
                                                        ? 'border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-50'
                                                        : 'border-white bg-white hover:border-slate-100 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl"
                                                        style={{ backgroundColor: f.color }}
                                                    >
                                                        {f.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm tracking-tight">{f.name}</div>
                                                        {expenseData.payer === f.id && <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">Primary Payer</div>}
                                                    </div>
                                                </div>
                                                {expenseData.payer === f.id && (
                                                    <div className="absolute top-4 right-4 text-blue-500">
                                                        <Check size={24} />
                                                    </div>
                                                )}
                                            </motion.button>
                                        ))}
                                </div>

                                {/* Subscriptions / Recurring */}
                                <div className="p-6 bg-slate-900 rounded-[40px] text-white flex items-center justify-between shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <RefreshCw size={24} className={expenseData.isRecurring ? 'animate-spin-slow' : ''} />
                                        </div>
                                        <div>
                                            <div className="font-black text-sm uppercase tracking-widest">Recurring Bill</div>
                                            <div className="text-[10px] text-white/50 font-bold">Auto-repeat every month</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpenseData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                                        className={`w-14 h-8 rounded-full relative transition-all ${expenseData.isRecurring ? 'bg-blue-500' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: expenseData.isRecurring ? 24 : 4 }}
                                            className="w-6 h-6 bg-white rounded-full absolute top-1"
                                        />
                                    </button>
                                </div>

                                {/* Advanced Breakdown Card */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-2xl overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Scale size={20} /></div>
                                        <h4 className="font-black text-slate-900 tracking-tighter text-xl">Split Intelligence</h4>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {expenseData.splitAmong.map(fid => (
                                            <div key={fid} className="flex justify-between items-center px-2">
                                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{friends.find(f => f.id === fid)?.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-lg text-slate-400 font-black">
                                                        {((expenseData.splits[fid] || 0) / expenseData.amount * 100).toFixed(0)}%
                                                    </span>
                                                    <span className="font-black text-slate-900 tracking-tight">
                                                        ${(expenseData.splits[fid] || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] text-white shadow-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1">Settlement via</div>
                                                <div className="font-black text-lg tracking-tight uppercase">{friends.find(f => f.id === expenseData.payer)?.name || 'Payer'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1">Final Liability</div>
                                                <div className="text-3xl font-black font-outfit">${expenseData.amount.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-4">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="px-8 py-5 bg-white border border-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                )}

                {step < 4 ? (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${canProceed()
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 translate-y-[-2px]'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Advance to Step {step + 1}
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleComplete}
                        disabled={!canProceed()}
                        className={`flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${canProceed()
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-200 translate-y-[-2px]'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Confirm & Log Transaction
                        <Check size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
