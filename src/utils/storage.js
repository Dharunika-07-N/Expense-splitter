// Storage utility
export const storage = {
    getFriends: () => JSON.parse(localStorage.getItem('friends') || '[]'),
    saveFriends: (friends) => localStorage.setItem('friends', JSON.stringify(friends)),

    getExpenses: () => JSON.parse(localStorage.getItem('expenses') || '[]'),
    saveExpenses: (expenses) => localStorage.setItem('expenses', JSON.stringify(expenses)),

    getGroups: () => JSON.parse(localStorage.getItem('groups') || '[]'),
    saveGroups: (groups) => localStorage.setItem('groups', JSON.stringify(groups)),

    clear: () => {
        localStorage.removeItem('friends');
        localStorage.removeItem('expenses');
        localStorage.removeItem('groups');
        localStorage.removeItem('recentFriends');
    }
};

// Friend model
export const createFriend = (name, phone = null) => ({
    id: Date.now() + Math.random(),
    name,
    phone,
    groups: [], // IDs of groups this friend belongs to
    color: getRandomColor()
});

// Group model
export const createGroup = (name, type = 'trip') => ({
    id: Date.now() + Math.random(),
    name,
    type, // 'trip', 'home', 'event', 'other'
    memberIds: [],
    date: new Date().toISOString()
});

// Expense model
export const createExpense = (description, amount, payer, splitAmong, category = '', splitMode = 'equal', splits = {}, currency = 'USD', isRecurring = false, items = []) => ({
    id: Date.now() + Math.random(),
    description,
    amount: parseFloat(amount),
    payer,
    splitAmong, // array of friend IDs
    splitMode, // 'equal', 'unequal', 'percentage', 'itemized'
    splits, // { friendId: amount }
    items, // [ { name, amount, participants: [] } ]
    isRecurring,
    currency,
    category,
    date: new Date().toISOString()
});

const getRandomColor = () => {
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};
