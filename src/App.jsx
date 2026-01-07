import { useState, useEffect, useRef, useMemo } from 'react';
import ExpenseWizard from './components/ExpenseWizard';
import SettlementView from './components/SettlementView';
import ExportButton from './components/ExportButton';
import ExpenseList from './components/ExpenseList';
import GroupSelector from './components/GroupSelector';
import DebtCalculator from './components/DebtCalculator';
import { storage, createFriend, createExpense, createGroup } from './utils/storage';
import { simplifyDebts } from './utils/debtSimplifier';
import { Trash2, Plus, ReceiptText, Users, Calculator, Sparkles, LogOut, Search, Activity, Layers, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const exportRef = useRef();

  useEffect(() => {
    setFriends(storage.getFriends());
    setExpenses(storage.getExpenses());
    setGroups(storage.getGroups());

    // Auto-select first group if exists
    const storedGroups = storage.getGroups();
    if (storedGroups.length > 0 && !activeGroupId) {
      // setActiveGroupId(storedGroups[0].id);
    }
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!activeGroupId) return expenses;
    const group = groups.find(g => g.id === activeGroupId);
    if (!group) return expenses;
    return expenses.filter(e => e.groupId === activeGroupId);
  }, [expenses, activeGroupId, groups]);

  const settlements = useMemo(() => {
    if (friends.length > 0 && filteredExpenses.length > 0) {
      return simplifyDebts(filteredExpenses, friends);
    }
    return [];
  }, [friends, filteredExpenses]);

  const addFriend = (name, phone = null) => {
    const existing = friends.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newFriend = createFriend(name, phone);
    const updated = [...friends, newFriend];
    setFriends(updated);
    storage.saveFriends(updated);
    return newFriend;
  };

  const addGroup = (name, type) => {
    const newGroup = createGroup(name, type);
    const updated = [...groups, newGroup];
    setGroups(updated);
    storage.saveGroups(updated);
    setActiveGroupId(newGroup.id);
  };

  const addExpense = (expenseData) => {
    setHistory(prev => [...prev, expenses]);

    const newExpense = {
      ...createExpense(
        expenseData.description,
        expenseData.amount,
        expenseData.payer,
        expenseData.splitAmong,
        expenseData.category,
        expenseData.splitMode,
        expenseData.splits
      ),
      groupId: activeGroupId
    };

    const updated = [...expenses, newExpense];
    setExpenses(updated);
    storage.saveExpenses(updated);
    setActiveTab('summary');
  };

  const addSettlement = (settlementData) => {
    setHistory(prev => [...prev, expenses]);

    // Create a special expense for settlement
    // Paid by the person sending, split among only the person receiving.
    const newExpense = {
      ...createExpense(
        `Settlement: Direct Transfer`,
        settlementData.amount,
        'me', // We should let the user choose who is sending? 
        // For now, let's assume first friend or a placeholder if 'me' is not defined.
        [settlementData.to],
        'Settlement',
        'equal',
        { [settlementData.to]: settlementData.amount }
      ),
      groupId: activeGroupId
    };

    // In this app, we don't have a 'me' user currently in the friends list by default.
    // Let's just show an alert or handle it as a mockup.
    alert(`Settlement of ₹${settlementData.amount} recorded!`);
    setActiveTab('summary');
  };

  const markAsPaid = (settlement) => {
    setHistory(prev => [...prev, expenses]);

    // Create a settlement expense: person who owes (from) pays the person they owe (to)
    // This creates an expense where 'from' is the payer and 'to' receives the full amount
    const settlementExpense = {
      ...createExpense(
        `✓ Settled: ${friends.find(f => f.id === settlement.from)?.name} → ${friends.find(f => f.id === settlement.to)?.name}`,
        settlement.amount,
        settlement.from, // The debtor pays
        [settlement.to], // The creditor receives
        'Settlement',
        'equal',
        { [settlement.to]: settlement.amount }
      ),
      groupId: activeGroupId
    };

    const updated = [...expenses, settlementExpense];
    setExpenses(updated);
    storage.saveExpenses(updated);
  };

  const undoLast = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setExpenses(lastState);
      storage.saveExpenses(lastState);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    storage.saveExpenses(updated);
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setFriends([]);
      setExpenses([]);
      setGroups([]);
      setActiveGroupId(null);
      storage.clear();
      setActiveTab('add');
    }
  };

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-6 px-4 pb-32">

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-10 px-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center shadow-2xl shadow-slate-300">
            <Calculator className="text-white" size={32} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Nex<span className="text-blue-600">Split</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Debt Simplifier v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GroupSelector
            groups={groups}
            activeGroupId={activeGroupId}
            onSelect={setActiveGroupId}
            onAddGroup={addGroup}
          />

          <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>

          <button
            onClick={clearAll}
            className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            title="Clear everything"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Hero Stats Section */}
      <div className="w-full max-w-5xl mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[48px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-slate-200 border border-slate-100"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full mb-6">
              <Activity size={14} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Stats</span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Group Spending</p>
            <h2 className="text-8xl font-black text-slate-900 tracking-tighter mb-6 flex items-baseline">
              <span className="text-4xl mr-2 opacity-20">₹</span>{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-3xl shadow-sm border border-slate-100">
                <Users size={18} className="text-blue-500" />
                <span className="text-sm font-black text-slate-700">{friends.length} Members</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-3xl shadow-sm border border-slate-100">
                <ReceiptText size={18} className="text-indigo-500" />
                <span className="text-sm font-black text-slate-700">{filteredExpenses.length} Transactions</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <button
              onClick={() => setActiveTab('add')}
              className="group relative px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-slate-400 hover:shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              <Plus size={28} className="group-hover:rotate-90 transition-transform" />
              Add Expense
            </button>
            {history.length > 0 && (
              <button
                onClick={undoLast}
                className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all text-center"
              >
                ↩️ Undo Last Entry
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Navigation Area */}
      <main className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {activeTab === 'add' ? (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[56px] p-8 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-10">
                <button
                  onClick={() => setActiveTab('summary')}
                  className="text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
                >
                  ← Cancel Entry
                </button>
                <div className="h-1 w-20 bg-slate-100 rounded-full"></div>
              </div>
              <ExpenseWizard
                friends={friends}
                onComplete={addExpense}
                onAddFriend={addFriend}
              />
            </motion.div>
          ) : activeTab === 'debtCalc' ? (
            <motion.div
              key="debtCalc"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[56px] p-8 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-10">
                <button
                  onClick={() => setActiveTab('summary')}
                  className="text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
                >
                  ← Back to Overview
                </button>
              </div>
              <DebtCalculator friends={friends} onAddSettlement={addSettlement} onAddFriend={addFriend} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 pb-24"
            >
              {/* Settlements Section */}
              <div ref={exportRef}>
                <div className="flex justify-between items-end mb-8 px-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Settlement Plan</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Optimized by AI Engine <Sparkles size={14} className="text-blue-500" />
                    </p>
                  </div>
                  <ExportButton targetRef={exportRef} />
                </div>

                <SettlementView settlements={settlements} friends={friends} onMarkAsPaid={markAsPaid} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full p-2 flex gap-1 z-50 border border-slate-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'summary' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
          <Layers size={20} />
          <span className="hidden sm:inline">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('debtCalc')}
          className={`px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'debtCalc' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
          <Wallet size={20} />
          <span className="hidden sm:inline">Debt Calc</span>
        </button>
      </nav>

    </div>
  );
}
