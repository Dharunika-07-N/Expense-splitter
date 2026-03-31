import { useState, useMemo } from 'react';
import QRCodeDisplay from './QRCode';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, ReceiptText, Wallet, BarChart3, Users, Filter, Download } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { Button, Card } from '../../ui/BaseUI';
import ExpenseWizard from '../expenses/ExpenseWizard';
import SettlementView from '../settlements/SettlementView';
import ExpenseList from '../expenses/ExpenseList';
import { simplifyDebts } from '../../../utils/debtSimplifier';
import SettleUpWizard from '../settlements/SettleUpWizard';
import GroupAnalytics from '../analytics/GroupAnalytics';
import CSVImporter from '../expenses/CSVImporter';
import Papa from 'papaparse';
import { createExpense } from '../../../utils/storage';

export default function GroupDetail({ groupId, onBack }) {
    const { groups, expenses, friends, addExpense, addFriend, addSettlement, deleteExpense, settlements, updateGroup } = useApp();

    const [activeTab, setActiveTab] = useState('expenses');
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [prefilledSettlement, setPrefilledSettlement] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [joinName, setJoinName] = useState('');
    const [joinAmount, setJoinAmount] = useState('');

    const group = groups.find(g => g.id === groupId);
    const contributedAmounts = useMemo(() => group?.contributedAmounts || {}, [group?.contributedAmounts]);
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    const groupSettlements = settlements.filter(s => s.groupId === groupId);

    const groupMembers = friends.filter(f => group?.memberIds.includes(f.id));
    const availableFriends = friends.filter(f => !group?.memberIds.includes(f.id));


    const totalSpent = useMemo(() => {
        return groupExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, [groupExpenses]);

    const suggestedSettlements = useMemo(() => {
        if (groupMembers.length > 0 && groupExpenses.length > 0) {
            return simplifyDebts(groupExpenses, groupMembers, groupSettlements, contributedAmounts);
        }
        return [];
    }, [groupMembers, groupExpenses, groupSettlements, contributedAmounts]);





    const handleSettleUp = (s = null) => {
        setPrefilledSettlement(s);
        setIsSettling(true);
    };

    const handleExportCSV = () => {
        const data = groupExpenses.map(e => ({
            date: e.date,
            description: e.description,
            amount: e.amount,
            payer: friends.find(f => f.id === e.payer)?.name || 'Unknown',
            category: e.category
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${group?.name}_expenses.csv`;
        a.click();
    };

    const handleBulkImport = (newExpenses) => {
        newExpenses.forEach(e => addExpense(e));
        setIsImporting(false);
    };

    if (!group) return <div className="p-20 text-center font-black">Group not found</div>;

    return (
        <div className="space-y-8">
            {/* QR Code for group joining */}
            <Card className="p-6 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black dark:text-white mb-4">Join via QR Code</h3>
                <QRCodeDisplay value={groupId} />

                {/* QR Join Form */}
                <div className="mt-4">
                    <h4 className="font-bold mb-2 dark:text-white">New Member? Join Now</h4>
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={joinName}
                            onChange={e => setJoinName(e.target.value)}
                            className="border px-3 py-2 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <input
                            type="number"
                            placeholder="Amount You're Contributing (₹)"
                            value={joinAmount}
                            onChange={e => setJoinAmount(e.target.value)}
                            className="border px-3 py-2 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <Button
                            variant="primary"
                            disabled={!joinName || !joinAmount}
                            onClick={() => {
                                const newId = Date.now().toString() + Math.random();
                                addFriend({ id: newId, name: joinName.trim() });
                                updateGroup(groupId, {
                                    memberIds: [...group.memberIds, newId],
                                    contributedAmounts: {
                                        ...contributedAmounts,
                                        [newId]: parseFloat(joinAmount)
                                    }
                                });
                                setJoinName('');
                                setJoinAmount('');
                            }}
                        >
                            Join Group
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Members Section */}
            <Card className="p-6 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-slate-400" />
                        <h3 className="text-xl font-black dark:text-white">Members ({groupMembers.length})</h3>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setIsAddingMember(true)}>
                        <Plus size={16} /> Add Existing Friend
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {groupMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <span className="dark:text-white">{m.name}</span>
                            <button
                                onClick={() => {
                                    updateGroup(groupId, {
                                        memberIds: group.memberIds.filter(id => id !== m.id)
                                    });
                                }}
                                className="ml-2 text-slate-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {isAddingMember && availableFriends.length > 0 && (
                    <div className="mt-4 flex gap-2">
                        <select
                            value={selectedMemberId}
                            onChange={e => setSelectedMemberId(e.target.value)}
                            className="flex-1 border px-3 py-2 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        >
                            <option value="">Select a friend</option>
                            {availableFriends.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={!selectedMemberId}
                            onClick={() => {
                                if (selectedMemberId) {
                                    updateGroup(groupId, { memberIds: [...group.memberIds, selectedMemberId] });
                                    setIsAddingMember(false);
                                    setSelectedMemberId('');
                                }
                            }}
                        >Add</Button>
                        <Button variant="danger" size="sm" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                    </div>
                )}
            </Card>

            {/* Total Expense Input */}
            {groupMembers.length > 0 && (
                <Card className="p-6 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black dark:text-white mb-4">Total Expense</h3>
                    <div className="flex gap-2 items-center">
                        <span className="text-2xl font-bold dark:text-white">₹</span>
                        <input
                            type="number"
                            placeholder="Enter total expense amount"
                            value={group.totalExpense || ''}
                            onChange={e => updateGroup(groupId, { totalExpense: parseFloat(e.target.value) || 0 })}
                            className="flex-1 border px-4 py-3 rounded-lg text-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                </Card>
            )}

            {/* Payment Breakdown */}
            {group.totalExpense && groupMembers.length > 0 && (
                <Card className="p-6 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black dark:text-white mb-4">💰 Payment Breakdown</h3>
                    <div className="space-y-3">
                        {groupMembers.map(m => {
                            const contributed = contributedAmounts[m.id] || 0;
                            const share = group.totalExpense / groupMembers.length;
                            const diff = Math.round((contributed - share) * 100) / 100;
                            return (
                                <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="font-bold dark:text-white mb-2">{m.name}</div>
                                    <div className="text-sm space-y-3 mt-2">
                                        <div className="dark:text-slate-300 flex flex-wrap items-center gap-2">
                                            <span>Contributed:</span>
                                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg items-center px-2 py-0.5">
                                                <span className="font-bold text-slate-500">₹</span>
                                                <input
                                                    type="number"
                                                    value={contributed || ''}
                                                    placeholder="0"
                                                    onChange={e => {
                                                        updateGroup(groupId, {
                                                            contributedAmounts: {
                                                                ...contributedAmounts,
                                                                [m.id]: parseFloat(e.target.value) || 0
                                                            }
                                                        });
                                                    }}
                                                    className="w-24 bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="dark:text-slate-300">Fair Share: <span className="font-semibold">₹{share.toFixed(2)}</span></div>
                                        <div className={`font-bold ${diff > 0 ? 'text-green-600 dark:text-green-400' : diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {diff > 0 ? `✅ Paid Extra: ₹${diff.toFixed(2)}` : diff < 0 ? `⚠️ Owes: ₹${(-diff).toFixed(2)}` : '✓ Settled'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-100 dark:border-slate-800 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-outfit">{group.name}</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {group.type} • {groupMembers.length} Members
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="secondary" size="md" className="flex-1 md:flex-none dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                        <Users size={18} />
                        Members
                    </Button>
                    <Button variant="blue" size="md" className="flex-1 md:flex-none" onClick={() => setIsAddingExpense(true)}>
                        <Plus size={20} />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-2 bg-slate-900 dark:bg-slate-800 text-white border-none py-8 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl"></div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Group Spending</p>
                    <h3 className="text-4xl font-black font-outfit">₹{totalSpent.toLocaleString()}</h3>
                </Card>
                <Card className="bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <p className="text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-widest mb-1">Balances</p>
                    <h3 className="text-2xl font-black text-blue-600">{groupMembers.length} People</h3>
                </Card>
                <Card className="bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <p className="text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-widest mb-1">Settled</p>
                    <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600">{groupSettlements.length} Done</h3>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl w-fit">
                {[
                    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
                    { id: 'settlements', label: 'Settlements', icon: Wallet },
                    { id: 'analytics', label: 'Insights', icon: BarChart3 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'expenses' && (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white font-outfit">Recent Transactions</h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500" onClick={() => setIsImporting(prev => !prev)}>
                                        <Filter size={16} />
                                        Import Bulk
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500" onClick={handleExportCSV}>
                                        <Download size={16} />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>

                            {isImporting && (
                                <div className="mb-8">
                                    <CSVImporter
                                        friends={groupMembers}
                                        groupId={groupId}
                                        onImport={handleBulkImport}
                                    />
                                </div>
                            )}

                            <ExpenseList
                                expenses={groupExpenses}
                                friends={friends}
                                onDelete={deleteExpense}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'settlements' && (
                        <motion.div
                            key="settlements"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-outfit">Settlement Plan</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Suggested transfers to reach zero balance</p>
                                </div>
                                <Button variant="secondary" onClick={() => handleSettleUp()} className="dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                                    <Plus size={16} />
                                    Record Payment
                                </Button>
                            </div>
                            <SettlementView
                                settlements={suggestedSettlements}
                                friends={friends}
                                onMarkAsPaid={handleSettleUp}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white font-outfit">Group Insights</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Spending patterns and participation</p>
                            </div>
                            <GroupAnalytics expenses={groupExpenses} members={groupMembers} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {isAddingExpense && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsAddingExpense(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 40 }}
                            className="bg-[#f8fafc] dark:bg-[#020617] rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 shadow-3xl relative border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Add New Expense</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Populate the transaction details</p>
                                </div>
                                <Button variant="ghost" onClick={() => setIsAddingExpense(false)} className="rounded-full w-12 h-12 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</Button>
                            </div>
                            <ExpenseWizard
                                friends={groupMembers}
                                onComplete={(data) => {
                                    addExpense(createExpense({ ...data, groupId }));
                                    setIsAddingExpense(false);
                                }}
                                onAddFriend={onBack}
                            />
                        </motion.div>
                    </motion.div>
                )}
                {isSettling && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsSettling(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 40 }}
                            className="bg-[#f8fafc] dark:bg-[#020617] rounded-[48px] w-full max-w-2xl p-12 shadow-3xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Record Payment</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manual settlement entry</p>
                                </div>
                                <Button variant="ghost" onClick={() => setIsSettling(false)} className="rounded-full w-12 h-12 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</Button>
                            </div>
                            <SettleUpWizard
                                friends={groupMembers}
                                groupId={groupId}
                                initialSettlement={prefilledSettlement}
                                onComplete={(data) => {
                                    addSettlement(data);
                                    setIsSettling(false);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
