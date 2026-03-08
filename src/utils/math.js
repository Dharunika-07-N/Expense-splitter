// SAFE MONEY MATH — always work in cents
export const toCents = (amount) => Math.round(amount * 100);
export const fromCents = (cents) => cents / 100;
