export function simplifyDebts(expenses, friends) {
    const balances = {};
    friends.forEach(f => balances[f.id] = 0);

    expenses.forEach(exp => {
        if (!exp.splitAmong || exp.splitAmong.length === 0) return;

        balances[exp.payer] += exp.amount;

        if (exp.splitMode === 'unequal' || exp.splitMode === 'percentage') {
            // Use custom splits
            Object.entries(exp.splits).forEach(([id, amt]) => {
                const friendId = parseFloat(id); // Ensure ID type matches
                // Small check for ID matching (storage uses Date.now() + Math.random())
                const actualId = Object.keys(balances).find(bid => bid == id);
                if (actualId) {
                    balances[actualId] -= amt;
                }
            });
        } else {
            // Default: Equal split
            const perPerson = exp.amount / exp.splitAmong.length;
            exp.splitAmong.forEach(id => {
                if (balances.hasOwnProperty(id)) {
                    balances[id] -= perPerson;
                }
            });
        }
    });

    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance > 0.01) creditors.push({ id, amount: balance });
        if (balance < -0.01) debtors.push({ id, amount: -balance });
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
        const credit = creditors[i].amount;
        const debt = debtors[j].amount;
        const settled = Math.min(credit, debt);

        settlements.push({
            from: debtors[j].id,
            to: creditors[i].id,
            amount: settled
        });

        creditors[i].amount -= settled;
        debtors[j].amount -= settled;

        if (creditors[i].amount < 0.01) i++;
        if (debtors[j].amount < 0.01) j++;
    }

    return settlements;
}

export function calculateBalances(expenses, friends) {
    const balances = {};
    friends.forEach(f => balances[f.id] = 0);

    expenses.forEach(exp => {
        if (!exp.splitAmong || exp.splitAmong.length === 0) return;

        balances[exp.payer] += exp.amount;

        if (exp.splitMode === 'unequal' || exp.splitMode === 'percentage') {
            Object.entries(exp.splits).forEach(([id, amt]) => {
                const actualId = Object.keys(balances).find(bid => bid == id);
                if (actualId) {
                    balances[actualId] -= amt;
                }
            });
        } else {
            const perPerson = exp.amount / exp.splitAmong.length;
            exp.splitAmong.forEach(id => {
                if (balances.hasOwnProperty(id)) {
                    balances[id] -= perPerson;
                }
            });
        }
    });

    return balances;
}
