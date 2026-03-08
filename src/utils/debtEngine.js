import { toCents, fromCents } from './math';

export function simplifyDebts(balances) {
    // balances = { userId: netBalance } 
    // positive = owed money, negative = owes money

    const creditors = [];
    const debtors = [];

    for (const [id, balance] of Object.entries(balances)) {
        const cents = toCents(balance);
        if (cents > 0) creditors.push({ id, amount: cents });
        else if (cents < 0) debtors.push({ id, amount: -cents });
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements = [];

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
        const settle = Math.min(creditors[i].amount, debtors[j].amount);
        settlements.push({
            from: debtors[j].id,
            to: creditors[i].id,
            amount: fromCents(settle),
        });

        creditors[i].amount -= settle;
        debtors[j].amount -= settle;

        if (creditors[i].amount === 0) i++;
        if (debtors[j].amount === 0) j++;
    }

    return settlements;
}
