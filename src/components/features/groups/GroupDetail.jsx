import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, ReceiptText, Wallet, BarChart3, Users, Settings, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Button, Card } from '../../ui/BaseUI';
import ExpenseWizard from '../../ExpenseWizard';
import SettlementView from '../../SettlementView';
import ExpenseList from '../../ExpenseList';
import { simplifyDebts } from '../../../utils/debtSimplifier';
import SettleUpWizard from '../settlements/SettleUpWizard';
import GroupAnalytics from '../analytics/GroupAnalytics';
import CSVImporter from '../expenses/CSVImporter';
import Papa from 'papaparse';

export default function GroupDetail({ groupId, onBack }) {
    const { groups, expenses, friends, addExpense, addSettlement, deleteExpense, settlements } = useApp();
    const [activeTab, setActiveTab] = useState('expenses');
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    const [isSettling, setIsSettling] = useState(false);
    const [prefilledSettlement, setPrefilledSettlement] = useState(null);

    const [isImporting, setIsImporting] = useState(false);

    const group = groups.find(g => g.id === groupId);
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    const groupSettlements = settlements.filter(s => s.groupId === groupId);

    const groupMembers = friends.filter(f => group.memberIds.includes(f.id));

    // For "My Balance" - let's assume the first member is "Me" if no other info
    const me = groupMembers[0];

    const totalSpent = useMemo(() => {
        return groupExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, [groupExpenses]);

    const suggestedSettlements = useMemo(() => {
        if (groupMembers.length > 0 && groupExpenses.length > 0) {
            return simplifyDebts(groupExpenses, groupMembers);
        }
        return [];
    }, [groupMembers, groupExpenses]);

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
        a.download = `${group.name}_expenses.csv`;
        a.click();
    };

    const handleBulkImport = (newExpenses) => {
        newExpenses.forEach(e => addExpense(e));
        setIsImporting(false);
    };

    if (!group) return <div>Group not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{group.name}</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {group.type} • {groupMembers.length} Members
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="secondary" size="md" className="flex-1 md:flex-none">
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
                <Card className="md:col-span-2 bg-slate-900 text-white border-none py-8">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Group Spending</p>
                    <h3 className="text-4xl font-black">₹{totalSpent.toLocaleString()}</h3>
                </Card>
                <Card className="bg-white border-slate-100">
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Balances</p>
                    <h3 className="text-2xl font-black text-blue-600">{groupMembers.length} People</h3>
                </Card>
                <Card className="bg-white border-slate-100">
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Settled</p>
                    <h3 className="text-2xl font-black text-slate-400">{groupSettlements.length} Done</h3>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
                {[
                    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
                    { id: 'settlements', label: 'Settlements', icon: Wallet },
                    { id: 'analytics', label: 'Insights', icon: BarChart3 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
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
                                <h3 className="text-xl font-black text-slate-900">Recent Transactions</h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => setIsImporting(prev => !prev)}>
                                        <Filter size={16} />
                                        Import Bulk
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-slate-400" onClick={handleExportCSV}>
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
                                    <h3 className="text-xl font-black text-slate-900">Settlement Plan</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Suggested transfers to reach zero balance</p>
                                </div>
                                <Button variant="secondary" onClick={() => handleSettleUp()}>
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
                                <h3 className="text-xl font-black text-slate-900">Group Insights</h3>
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
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsAddingExpense(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Add New Expense</h3>
                                <Button variant="ghost" onClick={() => setIsAddingExpense(false)}>Close</Button>
                            </div>
                            <ExpenseWizard
                                friends={groupMembers}
                                onComplete={(data) => {
                                    addExpense({ ...data, groupId });
                                    setIsAddingExpense(false);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
                {isSettling && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsSettling(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-2xl p-8 md:p-12 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Settle Up</h3>
                                <Button variant="ghost" onClick={() => setIsSettling(false)}>Close</Button>
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
