import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const data = [
    { value: 40 }, { value: 30 }, { value: 45 }, { value: 35 }, { value: 55 }, { value: 45 }, { value: 60 }, { value: 50 }, { value: 70 }
];

export function LeadsSnapshot() {
    return (
        <div className="h-full flex flex-col justify-between">
            {/* Big Metrics */}
            <div className="flex items-end gap-x-4 mb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Conversion</span>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white font-mono">83%</span>
                        <div className="flex items-center text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                        </div>
                    </div>
                </div>
                <div className="flex flex-col pl-4 border-l border-white/10">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Qualified</span>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-slate-300 font-mono">56%</span>
                        <div className="flex items-center text-xs text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                            <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2%
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Sparkline + Scatter context */}
            <div className="flex-1 min-h-[60px] relative w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#007BFF"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Dot scatter visual decoration (fake data points) */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                </div>
            </div>
        </div>
    );
}
