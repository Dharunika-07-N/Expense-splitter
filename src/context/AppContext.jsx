import { createContext, useState, useEffect, useCallback } from 'react';
import { storage, createActivity } from '../utils/storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadData = () => {
            setFriends(storage.getFriends());
            setGroups(storage.getGroups());
            setExpenses(storage.getExpenses());
            setSettlements(storage.getSettlements());
            setActivities(storage.getActivity());
            setSettings(storage.getSettings());
            setLoading(false);
        };
        loadData();
    }, []);

    // Helper to log activities
    const logActivity = useCallback((type, groupId, entityId, details = {}) => {
        const newActivity = createActivity(type, groupId, entityId, details);
        setActivities(prev => {
            const updated = [newActivity, ...prev].slice(0, 100); // Keep last 100
            storage.saveActivity(updated);
            return updated;
        });
    }, []);

    // CRUD Operations
    const addFriend = (friendData) => {
        setFriends(prev => {
            const updated = [...prev, friendData];
            storage.saveFriends(updated);
            return updated;
        });
    };

    const updateFriend = (id, updates) => {
        setFriends(prev => {
            const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
            storage.saveFriends(updated);
            return updated;
        });
    };

    const addGroup = (groupData) => {
        setGroups(prev => {
            const updated = [...prev, groupData];
            storage.saveGroups(updated);
            return updated;
        });
        logActivity('group_created', groupData.id, groupData.id, { name: groupData.name });
    };

    const updateGroup = (id, updates) => {
        setGroups(prev => {
            const updated = prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g);
            storage.saveGroups(updated);
            return updated;
        });
    };

    const deleteGroup = (id) => {
        setGroups(prev => {
            const updated = prev.filter(g => g.id !== id);
            storage.saveGroups(updated);
            return updated;
        });
        setExpenses(prev => {
            const updated = prev.filter(e => e.groupId !== id);
            storage.saveExpenses(updated);
            return updated;
        });
        setSettlements(prev => {
            const updated = prev.filter(s => s.groupId !== id);
            storage.saveSettlements(updated);
            return updated;
        });
    };

    const addExpense = (expenseData) => {
        setExpenses(prev => {
            const updated = [...prev, expenseData];
            storage.saveExpenses(updated);
            return updated;
        });
        logActivity('expense_added', expenseData.groupId, expenseData.id, {
            description: expenseData.description,
            amount: expenseData.amount
        });
    };

    const updateExpense = (id, updates) => {
        setExpenses(prev => {
            const updated = prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e);
            storage.saveExpenses(updated);
            return updated;
        });
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            logActivity('expense_edited', expense.groupId, id, { description: expense.description });
        }
    };

    const deleteExpense = (id) => {
        const expense = expenses.find(e => e.id === id);
        if (!expense) return;

        setExpenses(prev => {
            const updated = prev.filter(e => e.id !== id);
            storage.saveExpenses(updated);
            return updated;
        });
        logActivity('expense_deleted', expense.groupId, id, { description: expense.description });
    };

    const addSettlement = (settlementData) => {
        setSettlements(prev => {
            const updated = [...prev, settlementData];
            storage.saveSettlements(updated);
            return updated;
        });
        logActivity('settlement_added', settlementData.groupId, settlementData.id, {
            amount: settlementData.amount
        });
    };

    const updateSettings = (updates) => {
        setSettings(prev => {
            const updated = { ...prev, ...updates };
            storage.saveSettings(updated);
            return updated;
        });
    };

    const clearAllData = () => {
        storage.clear();
        setFriends([]);
        setGroups([]);
        setExpenses([]);
        setSettlements([]);
        setActivities([]);
        setSettings(storage.getSettings());
    };

    const value = {
        friends,
        groups,
        expenses,
        settlements,
        activities,
        settings,
        loading,
        addFriend,
        updateFriend,
        addGroup,
        updateGroup,
        deleteGroup,
        addExpense,
        updateExpense,
        deleteExpense,
        addSettlement,
        updateSettings,
        clearAllData,
        logActivity
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
