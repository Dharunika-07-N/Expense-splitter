export function calculateBalances(expenses, friends, settlements = [], initialContributions = {}) {
    const balances = {};
    friends.forEach(f => balances[f.id] = 0);

    // 1. Start with initial contributions (e.g., group joining fee)
    Object.entries(initialContributions).forEach(([id, amount]) => {
        if (Object.prototype.hasOwnProperty.call(balances, id)) {
            balances[id] += (parseFloat(amount) || 0);
        }
    });

    // 2. Add expenses
    expenses.forEach(exp => {
        if (!exp.splitAmong || exp.splitAmong.length === 0) return;

        // The person who paid gets credit
        if (Object.prototype.hasOwnProperty.call(balances, exp.payer)) {
            balances[exp.payer] += exp.amount;
        }

        // Subtract what each person owes
        if (exp.splitMode === 'unequal' || exp.splitMode === 'itemized') {
            // splits[id] holds a direct currency amount
            Object.entries(exp.splits).forEach(([id, amt]) => {
                if (Object.prototype.hasOwnProperty.call(balances, id)) {
                    balances[id] -= amt;
                }
            });
        } else if (exp.splitMode === 'percentage') {
            // splits[id] holds a percentage value (0–100)
            Object.entries(exp.splits).forEach(([id, pct]) => {
                if (Object.prototype.hasOwnProperty.call(balances, id)) {
                    balances[id] -= (exp.amount * pct / 100);
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

    // 3. Adjust for manual settlements (payments)
    settlements.forEach(settle => {
        if (Object.prototype.hasOwnProperty.call(balances, settle.from)) {
            balances[settle.from] += settle.amount; // They paid, so they are "owed" more back (or owe less)
        }
        if (Object.prototype.hasOwnProperty.call(balances, settle.to)) {
            balances[settle.to] -= settle.amount; // They received, so they "owe" more (or are owed less)
        }
    });

    // Final rounding to avoid IEEE 754 precision issues
    Object.keys(balances).forEach(id => {
        balances[id] = Math.round(balances[id] * 100) / 100;
    });

    return balances;
}

export function simplifyDebts(expenses, friends, settlements = [], initialContributions = {}) {
    const balances = calculateBalances(expenses, friends, settlements, initialContributions);

    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance > 0.01) creditors.push({ id, amount: balance });
        else if (balance < -0.01) debtors.push({ id, amount: -balance });
    });

    // Sort to minimize number of transfers
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const result = [];
    let i = 0, j = 0;

    // Use a while loop to match debtors with creditors
    while (i < creditors.length && j < debtors.length) {
        const credit = creditors[i].amount;
        const debt = debtors[j].amount;
        const settled = Math.min(credit, debt);

        result.push({
            from: debtors[j].id,
            to: creditors[i].id,
            amount: Math.round(settled * 100) / 100
        });

        creditors[i].amount = Math.round((creditors[i].amount - settled) * 100) / 100;
        debtors[j].amount = Math.round((debtors[j].amount - settled) * 100) / 100;

        if (creditors[i].amount < 0.01) i++;
        if (debtors[j].amount < 0.01) j++;
    }

    return result;
}

