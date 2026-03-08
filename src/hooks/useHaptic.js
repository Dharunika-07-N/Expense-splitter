import { useCallback } from 'react';

export function useHaptic() {
    const haptic = useCallback((type = 'light') => {
        if (!navigator.vibrate) return;
        const patterns = { light: [10], medium: [20], success: [10, 50, 10], error: [50, 30, 50] };
        navigator.vibrate(patterns[type]);
    }, []);

    return haptic;
}
