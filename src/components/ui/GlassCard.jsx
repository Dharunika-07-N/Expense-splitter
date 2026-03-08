export default function GlassCard({ children, className = '' }) {
    return (
        <div className={`
      relative rounded-2xl border border-white/10
      bg-white/60 dark:bg-slate-900/60
      backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40
      ${className}
    `}>
            {children}
        </div>
    );
}
