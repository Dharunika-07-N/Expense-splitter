const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getExchangeRates(base = 'USD') {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
        try {
            const { rates, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return rates;
            }
        } catch (e) {
            console.error('Failed to parse cached rates', e);
        }
    }

    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const data = await response.json();

        if (data && data.rates) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                rates: data.rates,
                timestamp: Date.now()
            }));
            return data.rates;
        }
        return null;
    } catch (error) {
        console.error('Currency fetch failed:', error);
        return null;
    }
}

export function convertCurrency(amount, from, to, rates) {
    if (!rates || from === to) return amount;

    // rates[from] is how many 'from' per 1 USD
    // inUSD = amount / rates[from]
    // toAmount = inUSD * rates[to]

    const rateFrom = rates[from];
    const rateTo = rates[to];

    if (!rateFrom || !rateTo) return amount;

    return (amount / rateFrom) * rateTo;
}
