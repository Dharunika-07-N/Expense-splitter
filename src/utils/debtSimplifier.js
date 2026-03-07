export function simplifyDebts(expenses, friends) {
    const balances = {};
    friends.forEach(f => balances[f.id] = 0);

    expenses.forEach(exp => {
        if (!exp.splitAmong || exp.splitAmong.length === 0) return;

        // Add payer's amount
        if (Object.prototype.hasOwnProperty.call(balances, exp.payer)) {
            balances[exp.payer] += exp.amount;
        }

        // Handle splits
        if (exp.splitMode === 'unequal' || exp.splitMode === 'percentage') {
            Object.entries(exp.splits).forEach(([id, amt]) => {
                // Use strict ID matching
                if (Object.prototype.hasOwnProperty.call(balances, id)) {
                    balances[id] -= amt;
                }
            });
        } else {
            // Default: Equal split
            const perPerson = exp.amount / exp.splitAmong.length;
            exp.splitAmong.forEach(id => {
                if (Object.prototype.hasOwnProperty.call(balances, id)) {
                    balances[id] -= perPerson;
                }
            });
        }
    });

    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        // Round to 2 decimals for accuracy
        const rounded = Math.round(balance * 100) / 100;
        if (rounded > 0.01) creditors.push({ id, amount: rounded });
        if (rounded < -0.01) debtors.push({ id, amount: -rounded });
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
            amount: Math.round(settled * 100) / 100
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
                const actualId = Object.keys(balances).find(bid => bid === id);
                if (actualId) {
                    balances[actualId] -= amt;
                }
            });
        } else {
            const perPerson = exp.amount / exp.splitAmong.length;
            exp.splitAmong.forEach(id => {
                if (Object.prototype.hasOwnProperty.call(balances, id)) {
                    balances[id] -= perPerson;
                }
            });
        }
    });

    return balances;
}
