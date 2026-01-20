import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Scale, Percent, Divide, List, Plus, Trash2, RefreshCw, Upload } from 'lucide-react';
import SmartFriendSelector from '../friends/SmartFriendSelector';
import GamifiedAmountInput from './GamifiedAmountInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../../ui/BaseUI';

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
    const fileInputRef = useRef(null);

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
                    if (Math.abs(total - expenseData.amount) > 0.05) return `Total (₹${total.toFixed(2)}) must match expense (₹${expenseData.amount.toFixed(2)}).`;
                }
                if (expenseData.splitMode === 'percentage') {
                    const pctSum = Object.values(expenseData.splits).map(v => (v / expenseData.amount * 100)).reduce((a, b) => a + b, 0);
                    if (Math.abs(pctSum - 100) > 0.5) return `Percentages must sum to 100%. Current: ${pctSum.toFixed(1)}%`;
                }
                if (expenseData.splitMode === 'itemized') {
                    const itemTotal = expenseData.items.reduce((s, i) => s + i.amount, 0);
                    if (Math.abs(itemTotal - expenseData.amount) > 0.05) return `Item total (₹${itemTotal.toFixed(2)}) must match total (₹${expenseData.amount.toFixed(2)}).`;
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

    const handleOCRClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setIsScanning(true);
            setTimeout(() => {
                setIsScanning(false);
                setExpenseData(prev => ({
                    ...prev,
                    description: `Split from Bill`,
                    splitMode: 'itemized',
                    items: [
                        { id: 101, name: 'Main Course', amount: prev.amount * 0.6, participants: [] },
                        { id: 102, name: 'Beverages', amount: prev.amount * 0.2, participants: [] },
                        { id: 103, name: 'Extras', amount: prev.amount * 0.2, participants: [] }
                    ]
                }));
                setStep(3);
            }, 2000);
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

    const steps = [
        { id: 1, title: 'Total Figure', subtitle: 'Enter the amount for calculation' },
        { id: 2, title: 'Context', subtitle: 'What was this expense for?' },
        { id: 3, title: 'Split Engine', subtitle: 'Choose your math algorithm' },
        { id: 4, title: 'Confirmation', subtitle: 'Final poyer and recurring state' },
    ];

    return (
        <div className="max-w-xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 font-outfit">
                            {steps[step - 1].title}
                        </h2>
                        <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]">{steps[step - 1].subtitle}</p>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-10 bg-blue-600' : 'w-2 bg-slate-100 dark:bg-slate-800'}`}></div>
                    ))}
                </div>
            </div>

            {/* ERROR AREA */}
            <AnimatePresence>
                {validationError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center gap-4">
                            <div className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center font-black">!</div>
                            <span className="text-xs font-black uppercase tracking-widest">{validationError}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STEP CONTENT */}
            <div className="min-h-[420px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        {step === 1 && (
                            <GamifiedAmountInput
                                value={expenseData.amount}
                                onChange={(amount) => setExpenseData(prev => ({ ...prev, amount }))}
                                onCategorySelect={(category) => setExpenseData(prev => ({ ...prev, category }))}
                            />
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <Card className="p-12 text-center group border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="text-7xl mb-8 group-hover:scale-110 transition-transform">📚</div>
                                    <input
                                        type="text"
                                        value={expenseData.description}
                                        onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="What's the story?"
                                        className="w-full text-4xl font-black bg-transparent border-none text-center focus:ring-0 outline-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 font-outfit"
                                        autoFocus
                                    />
                                    <div className="h-1 w-24 mx-auto bg-blue-500/20 mt-8 rounded-full group-hover:w-48 transition-all"></div>

                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <Button
                                        variant="secondary"
                                        size="xl"
                                        onClick={handleOCRClick}
                                        className="mt-10 mx-auto rounded-3xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white shadow-xl"
                                    >
                                        {isScanning ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                                        {isScanning ? 'Parsing Bill...' : 'Upload Receipt Scan'}
                                    </Button>
                                </Card>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10">
                                <SmartFriendSelector
                                    friends={friends}
                                    selected={expenseData.splitAmong}
                                    onSelect={(fid) => {
                                        setExpenseData(prev => {
                                            const newSplit = prev.splitAmong.includes(fid)
                                                ? prev.splitAmong.filter(id => id !== fid)
                                                : [...prev.splitAmong, fid];
                                            return { ...prev, splitAmong: newSplit };
                                        });
                                    }}
                                    onAddManual={onAddFriend}
                                />

                                {expenseData.splitAmong.length > 0 && (
                                    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mb-6 px-4">Algorithm Selection</p>
                                        <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-[32px] mb-8">
                                            {[
                                                { id: 'equal', icon: Divide, label: 'Equal' },
                                                { id: 'unequal', icon: Scale, label: 'Exact' },
                                                { id: 'percentage', icon: Percent, label: 'Pct' },
                                                { id: 'itemized', icon: List, label: 'Tab' },
                                            ].map(mode => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setExpenseData(prev => ({ ...prev, splitMode: mode.id }))}
                                                    className={`py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${expenseData.splitMode === mode.id ? 'bg-white dark:bg-slate-800 shadow-xl text-blue-600' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
                                                >
                                                    <mode.icon size={18} />
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Dynamic UI based on mode */}
                                        {expenseData.splitMode === 'itemized' && (
                                            <div className="space-y-4">
                                                {expenseData.items.map(item => (
                                                    <Card key={item.id} className="p-6 border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
                                                        <div className="flex gap-4 mb-4">
                                                            <input
                                                                placeholder="Item"
                                                                className="flex-1 font-black text-slate-800 dark:text-white border-none bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500/20"
                                                                value={item.name}
                                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                            />
                                                            <div className="relative group">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-xs">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-32 pl-8 pr-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-none rounded-2xl font-black text-blue-600 text-right"
                                                                    value={item.amount || ''}
                                                                    onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setExpenseData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== item.id) }))}
                                                                className="text-rose-300 hover:text-rose-500"
                                                            >
                                                                <Trash2 size={20} />
                                                            </Button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {expenseData.splitAmong.map(fid => (
                                                                <button
                                                                    key={fid}
                                                                    onClick={() => toggleItemParticipant(item.id, fid)}
                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.participants.includes(fid) ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                                                                >
                                                                    {friends.find(f => f.id === fid)?.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                ))}
                                                <Button variant="ghost" className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] text-slate-400 font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all" onClick={addItem}>
                                                    <Plus size={18} /> Add Custom Item
                                                </Button>
                                            </div>
                                        )}

                                        {(expenseData.splitMode === 'unequal' || expenseData.splitMode === 'percentage') && (
                                            <div className="space-y-3">
                                                {expenseData.splitAmong.map(fid => (
                                                    <div key={fid} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] shadow-sm">
                                                        <span className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest">{friends.find(f => f.id === fid)?.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="number"
                                                                className="w-28 text-right px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                                                value={expenseData.splitMode === 'percentage'
                                                                    ? (((expenseData.splits[fid] || 0) / expenseData.amount) * 100).toFixed(0)
                                                                    : (expenseData.splits[fid] || '').toString()
                                                                }
                                                                onChange={(e) => updateCustomSplit(fid, e.target.value, expenseData.splitMode)}
                                                            />
                                                            <span className="font-black text-slate-200 dark:text-slate-800">{expenseData.splitMode === 'percentage' ? '%' : '₹'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {friends.filter(f => expenseData.splitAmong.includes(f.id)).map(f => (
                                        <motion.button
                                            key={f.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setExpenseData(prev => ({ ...prev, payer: f.id }))}
                                            className={`p-6 rounded-[32px] border-2 transition-all text-left relative overflow-hidden ${expenseData.payer === f.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-white dark:border-transparent bg-white dark:bg-slate-900 shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: f.color }}>{f.avatar}</div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-slate-900 dark:text-white text-sm truncate">{f.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{expenseData.payer === f.id ? 'Payer' : 'Participant'}</div>
                                                </div>
                                            </div>
                                            {expenseData.payer === f.id && <div className="absolute top-4 right-4 text-blue-500"><Check size={20} /></div>}
                                        </motion.button>
                                    ))}
                                </div>

                                <Card className="p-1.5 bg-slate-900 dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden border-none text-white">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><RefreshCw size={24} className={expenseData.isRecurring ? 'animate-spin-slow' : ''} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Advanced Settings</p>
                                                    <p className="font-black text-sm uppercase tracking-widest">Mark as Recurring Bill</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setExpenseData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                                                className={`w-14 h-8 rounded-full relative transition-all ${expenseData.isRecurring ? 'bg-blue-500' : 'bg-white/10'}`}
                                            >
                                                <motion.div animate={{ x: expenseData.isRecurring ? 26 : 6 }} className="w-5 h-5 bg-white rounded-full absolute top-1.5 shadow-sm" />
                                            </button>
                                        </div>

                                        <div className="pt-8 border-t border-white/5 space-y-4">
                                            {expenseData.splitAmong.map(fid => (
                                                <div key={fid} className="flex justify-between items-center px-2">
                                                    <span className="text-white/40 font-black uppercase text-[10px] tracking-widest">{friends.find(f => f.id === fid)?.name}</span>
                                                    <span className="font-black text-lg tracking-tight font-outfit">₹{(expenseData.splits[fid] || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex justify-between items-center rounded-b-[38px]">
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Payload</p>
                                            <p className="text-4xl font-black font-outfit tracking-tighter">₹{expenseData.amount.toLocaleString()}</p>
                                        </div>
                                        <Sparkles className="text-white/20" size={32} />
                                    </div>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* NAV CONTROLS */}
            <div className="flex gap-4">
                {step > 1 && (
                    <Button variant="secondary" size="xl" onClick={handleBack} className="rounded-3xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm px-10">
                        <ArrowLeft size={20} />
                    </Button>
                )}
                <Button
                    variant="blue"
                    size="xl"
                    className="flex-1 rounded-3xl shadow-xl shadow-blue-500/20"
                    onClick={step === 4 ? handleComplete : handleNext}
                >
                    {step === 4 ? 'Confirm & Deploy Transaction' : `Next Phase: ${steps[step].title}`}
                    {step === 4 ? <Check size={20} /> : <ArrowRight size={20} />}
                </Button>
            </div>
        </div>
    );
}
