import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface MetricCounterProps {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'blue' | 'cyan' | 'orange' | 'pink' | 'green';
    icon?: ReactNode;
    sparklineData?: number[];
    isLive?: boolean;
}

// Mini Sparkline Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 24;
    const width = 60;
    const step = width / (data.length - 1);

    const points = data.map((value, i) => ({
        x: i * step,
        y: height - ((value - min) / range) * height
    }));

    const pathD = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cpx1 = prev.x + step / 2;
        const cpx2 = point.x - step / 2;
        return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const colorMap: Record<string, string> = {
        blue: '#007BFF',
        cyan: '#00BFFF',
        orange: '#FFA500',
        pink: '#FF69B4',
        green: '#10B981'
    };

    return (
        <svg width={width} height={height} className="opacity-50 group-hover:opacity-80 transition-opacity">
            <defs>
                <linearGradient id={`spark-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colorMap[color]} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colorMap[color]} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
                fill={`url(#spark-${color})`}
            />
            <path
                d={pathD}
                fill="none"
                stroke={colorMap[color]}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2"
                fill={colorMap[color]}
            />
        </svg>
    );
}

// Animated Number Component
function AnimatedValue({ value }: { value: string | number }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    return (
        <motion.span
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {displayValue}
        </motion.span>
    );
}

export function MetricCounter({
    label,
    value,
    subValue,
    trend,
    trendValue,
    color = 'blue',
    icon,
    sparklineData,
    isLive
}: MetricCounterProps) {
    const glowMap: Record<string, string> = {
        blue: 'rgba(0, 123, 255, 0.15)',
        cyan: 'rgba(0, 191, 255, 0.15)',
        orange: 'rgba(255, 165, 0, 0.15)',
        pink: 'rgba(255, 105, 180, 0.15)',
        green: 'rgba(16, 185, 129, 0.15)'
    };

    const iconColorMap: Record<string, string> = {
        blue: 'text-blue-400',
        cyan: 'text-cyan-400',
        orange: 'text-orange-400',
        pink: 'text-pink-400',
        green: 'text-emerald-400'
    };

    const trendColor = trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10';
    const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="glass-card group h-full relative"
        >
            {/* Top Glow Accent */}
            <div
                className="absolute inset-x-0 top-0 h-px opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${glowMap[color]}, transparent)` }}
            />

            <div className="relative z-10 flex flex-col p-4 h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className={`${iconColorMap[color]} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                {icon}
                            </div>
                        )}
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</h3>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] text-emerald-400 font-mono font-bold">LIVE</span>
                        </div>
                    )}
                </div>

                {/* Value Row */}
                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                            <AnimatedValue value={value} />
                        </div>
                        {subValue && (
                            <div className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">{subValue}</div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1 mb-1">
                        {sparklineData && (
                            <Sparkline data={sparklineData} color={color} />
                        )}
                        {trendValue && (
                            <div className={`flex items-center gap-0.5 text-[9px] font-bold ${trendColor} px-1.5 py-0.5 rounded`}>
                                <TrendIcon className="w-2.5 h-2.5" />
                                {trendValue}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle Corner Glow */}
            <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                style={{ background: glowMap[color] }}
            />
        </motion.div>
    );
}
