import { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string;
    change?: string; // e.g. "+12.5%"
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'purple' | 'yellow' | 'cyan' | 'magenta';
    className?: string;
}

function Counter({ value }: { value: string }) {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const isPercentage = value.includes('%');
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => {
        if (isPercentage) return `${current.toFixed(1)}%`;
        return Math.floor(current).toLocaleString(); // Simple format
    });

    useEffect(() => {
        spring.set(numericValue);
    }, [spring, numericValue]);

    return <motion.span>{display}</motion.span>;
}

export function StatCard({ title, value, change, icon: Icon, color = 'blue', className = '' }: StatCardProps) {
    const colorMap = {
        blue: 'text-blue-400 group-hover:text-blue-300',
        green: 'text-emerald-400 group-hover:text-emerald-300',
        purple: 'text-purple-400 group-hover:text-purple-300',
        yellow: 'text-yellow-400 group-hover:text-yellow-300',
        cyan: 'text-cyan-400 group-hover:text-cyan-300',
        magenta: 'text-fuchsia-400 group-hover:text-fuchsia-300'
    };

    const bgMap = {
        blue: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
        green: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
        purple: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 group-hover:border-yellow-500/40',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
        magenta: 'bg-fuchsia-500/10 border-fuchsia-500/20 group-hover:border-fuchsia-500/40',
    };

    return (
        <div className={`p-6 flex flex-col justify-between h-full relative group overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-lg ${bgMap[color]} transition-colors`}>
                    <Icon className={`w-4 h-4 ${colorMap[color]}`} />
                </div>
            </div>

            {/* Value */}
            <div className="mt-4 z-10">
                <div className="text-4xl font-mono font-bold text-white tracking-tight flex items-baseline gap-2">
                    <Counter value={value} />
                </div>
                {change && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${bgMap[color]} ${colorMap[color]}`}>
                            {change}
                        </span>
                        <span className="text-xs text-slate-500">vs last period</span>
                    </div>
                )}
            </div>

            {/* Background Glow Effect (Optional) */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${bgMap[color].split(' ')[0].replace('/10', '/30')}`}></div>
        </div>
    );
}
