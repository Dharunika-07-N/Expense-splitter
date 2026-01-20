import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Wallet, Smartphone, Banknote, CreditCard, HelpCircle } from 'lucide-react';
import { Button, Card, Input } from '../../ui/BaseUI';
import { createSettlement } from '../../../utils/storage';

export default function SettleUpWizard({ friends, groupId, onComplete, initialSettlement = null }) {
    const [step, setStep] = useState(initialSettlement ? 2 : 1);
    const [settlementData, setSettlementData] = useState({
        from: initialSettlement?.from || '',
        to: initialSettlement?.to || '',
        amount: initialSettlement?.amount || 0,
        method: 'cash',
        notes: '',
        reference: ''
    });

    const methods = [
        { id: 'upi', label: 'UPI / PhonePe', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'bank', label: 'Bank Transfer', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'other', label: 'Other', icon: HelpCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        onComplete(createSettlement({ ...settlementData, groupId }));
    };

    const fromFriend = friends.find(f => f.id === settlementData.from);
    const toFriend = friends.find(f => f.id === settlementData.to);

    return (
        <div className="space-y-8">
            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Who is paying?</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Select the person sending money</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {friends.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => { setSettlementData({ ...settlementData, from: f.id }); setStep(2); }}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${settlementData.from === f.id ? 'border-blue-500 bg-blue-50' : 'border-slate-50 bg-white hover:border-slate-100'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: f.color }}>
                                        {f.avatar}
                                    </div>
                                    <span className="font-black text-slate-900 text-sm truncate w-full text-center">{f.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Payment Details</h3>
                            <div className="mt-4 flex items-center justify-center gap-4">
                                <span className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-xs">{fromFriend?.name}</span>
                                <ArrowRight size={16} className="text-slate-300" />
                                <select
                                    className="bg-blue-50 border-none rounded-xl font-bold text-blue-600 text-xs py-2 px-4 outline-none"
                                    value={settlementData.to}
                                    onChange={(e) => setSettlementData({ ...settlementData, to: e.target.value })}
                                >
                                    <option value="">To whom?</option>
                                    {friends.filter(f => f.id !== settlementData.from).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="max-w-xs mx-auto">
                            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Amount Paid</p>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200">₹</span>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border-none rounded-[32px] py-10 text-center text-6xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-outfit"
                                    value={settlementData.amount || ''}
                                    onChange={(e) => setSettlementData({ ...settlementData, amount: parseFloat(e.target.value) || 0 })}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                            <Button
                                variant="blue"
                                className="flex-1"
                                disabled={!settlementData.to || !settlementData.amount}
                                onClick={() => setStep(3)}
                            >
                                Next
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">How was it paid?</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Optional payment confirmation</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {methods.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSettlementData({ ...settlementData, method: m.id })}
                                    className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${settlementData.method === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-50 bg-white hover:border-slate-100'
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl ${m.bg} ${m.color}`}>
                                        <m.icon size={20} />
                                    </div>
                                    <span className="font-bold text-slate-900 text-xs">{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <Input
                            label="Notes (Optional)"
                            value={settlementData.notes}
                            onChange={e => setSettlementData({ ...settlementData, notes: e.target.value })}
                            placeholder="Lunch settlement..."
                        />

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                            <Button variant="blue" className="flex-1" onClick={handleSubmit}>
                                Confirm Payment
                                <Check size={18} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
