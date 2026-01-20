import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
    const variants = {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200',
        secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
        blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        xl: 'px-10 py-5 text-lg',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                'rounded-2xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function Input({ className, label, error, ...props }) {
    return (
        <div className="space-y-2 w-full">
            {label && <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
            <input
                className={cn(
                    "w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none",
                    error && "ring-2 ring-rose-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
}
