import { toCents, fromCents } from './math';

// EQUAL SPLIT — penny-perfect
export function equalSplit(totalAmount, participants) {
    const totalCents = toCents(totalAmount);
    const n = participants.length;
    const baseCents = Math.floor(totalCents / n);
    const remainder = totalCents - baseCents * n;

    return participants.map((p, i) => ({
        id: p.id,
        name: p.name,
        amount: fromCents(i === n - 1 ? baseCents + remainder : baseCents),
    }));
}

// PERCENTAGE SPLIT — validates to exactly 100%
export function percentageSplit(totalAmount, participants) {
    const totalCents = toCents(totalAmount);
    const totalPct = participants.reduce((s, p) => s + p.percentage, 0);
    if (Math.abs(totalPct - 100) > 0.01) throw new Error('Percentages must sum to 100%');

    let assigned = 0;
    return participants.map((p, i) => {
        if (i === participants.length - 1) {
            return { ...p, amount: fromCents(totalCents - assigned) };
        }
        const cut = Math.round((p.percentage / 100) * totalCents);
        assigned += cut;
        return { ...p, amount: fromCents(cut) };
    });
}

// ITEMIZED / TAB SPLIT
export function tabSplit(items) {
    const owings = {};
    for (const item of items) {
        const perPerson = toCents(item.price) / item.assignedTo.length;
        item.assignedTo.forEach((pid, i) => {
            const share = i === item.assignedTo.length - 1
                ? Math.round(toCents(item.price) - Math.floor(perPerson) * (item.assignedTo.length - 1))
                : Math.floor(perPerson);
            owings[pid] = (owings[pid] || 0) + share;
        });
    }
    return Object.entries(owings).map(([id, cents]) => ({ id, amount: fromCents(cents) }));
}
