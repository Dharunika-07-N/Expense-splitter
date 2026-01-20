import { v4 as uuidv4 } from 'uuid';

// Storage Keys
const KEYS = {
    FRIENDS: 'nexsplit_friends',
    GROUPS: 'nexsplit_groups',
    EXPENSES: 'nexsplit_expenses',
    SETTLEMENTS: 'nexsplit_settlements',
    ACTIVITY: 'nexsplit_activity',
    SETTINGS: 'nexsplit_settings'
};

export const storage = {
    // Basic CRUD with JSON parse/stringify
    getData: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    setData: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

    getFriends: () => storage.getData(KEYS.FRIENDS),
    saveFriends: (friends) => storage.setData(KEYS.FRIENDS, friends),

    getGroups: () => storage.getData(KEYS.GROUPS),
    saveGroups: (groups) => storage.setData(KEYS.GROUPS, groups),

    getExpenses: () => storage.getData(KEYS.EXPENSES),
    saveExpenses: (expenses) => storage.setData(KEYS.EXPENSES, expenses),

    getSettlements: () => storage.getData(KEYS.SETTLEMENTS),
    saveSettlements: (settlements) => storage.setData(KEYS.SETTLEMENTS, settlements),

    getActivity: () => storage.getData(KEYS.ACTIVITY),
    saveActivity: (activity) => storage.setData(KEYS.ACTIVITY, activity),

    getSettings: () => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify({
        theme: 'light',
        defaultCurrency: 'INR',
        notifications: true,
        onboardingCompleted: false,
        lastBackup: null
    })),
    saveSettings: (settings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),

    clear: () => {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    },

    // Full export/import
    exportAll: () => {
        const data = {};
        Object.entries(KEYS).forEach(([name, key]) => {
            data[name] = JSON.parse(localStorage.getItem(key) || (name === 'SETTINGS' ? 'null' : '[]'));
        });
        return data;
    },

    importAll: (data) => {
        if (!data) return false;
        try {
            Object.entries(KEYS).forEach(([name, key]) => {
                if (data[name]) {
                    localStorage.setItem(key, JSON.stringify(data[name]));
                }
            });
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    }
};

// Models
export const createFriend = (name, phone = '', email = '', color = null) => ({
    id: uuidv4(),
    name,
    phone,
    email,
    color: color || getRandomColor(),
    avatar: name.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
    groups: []
});

export const createGroup = (name, type = 'other', currency = 'INR') => ({
    id: uuidv4(),
    name,
    type, // 'trip', 'home', 'event', 'roommates', 'other'
    description: '',
    memberIds: [],
    currency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    coverImage: `linear-gradient(135deg, ${getRandomColor()} 0%, ${getRandomColor()} 100%)`
});

export const createExpense = ({
    description,
    amount,
    payer,
    splitAmong,
    groupId,
    category = 'Other',
    splitMode = 'equal',
    splits = {},
    currency = 'INR',
    notes = '',
    isRecurring = false
}) => ({
    id: uuidv4(),
    groupId,
    description,
    amount: parseFloat(amount),
    currency,
    payer, // friend id
    splitAmong, // array of ids
    splitMode, // 'equal', 'unequal', 'percentage', 'shares'
    splits, // {id: amount}
    category,
    notes,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRecurring,
    recurringConfig: null
});

export const createSettlement = ({
    groupId,
    from,
    to,
    amount,
    currency = 'INR',
    method = 'cash',
    notes = '',
    reference = ''
}) => ({
    id: uuidv4(),
    groupId,
    from,
    to,
    amount: parseFloat(amount),
    currency,
    method, // 'cash', 'upi', 'bank', 'card', 'other'
    notes,
    reference,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
});

export const createActivity = (type, groupId, entityId, details = {}) => ({
    id: uuidv4(),
    type, // 'expense_added', 'expense_edited', 'expense_deleted', 'settlement_added', 'group_created'
    groupId,
    entityId,
    timestamp: new Date().toISOString(),
    details
});

function getRandomColor() {
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
