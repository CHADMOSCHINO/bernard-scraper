import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
    { name: 'Aug', max: 60, min: 20 },
    { name: '', max: 65, min: 25 },
    { name: '', max: 55, min: 35 },
    { name: 'Sep', max: 75, min: 15 },
    { name: '', max: 60, min: 40 },
    { name: 'Week 8', max: 40, min: 60, isPoint: true },
    { name: '', max: 30, min: 50 },
    { name: 'Oct', max: 50, min: 40 },
    { name: '', max: 60, min: 30 },
    { name: 'Nov', max: 45, min: 20 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card p-3 rounded-xl shadow-lg border border-border text-center">
                <p className="font-bold text-foreground mb-1">{label === 'Week 8' ? 'Week 8' : 'Week 4'}</p>
                <p className="text-xs text-muted-foreground">Unbalanced</p>
            </div>
        );
    }

    return null;
};

export function AnalyticsChart() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Focusing</h3>
                    <p className="text-muted-foreground">Productivity analytics</p>
                </div>

                <button className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                    Range: Last month
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 w-full min-h-[300px] relative">
                {/* Gemini Insight Overlay */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs text-indigo-300 font-mono">Gemini: Stability Pred. 92%</span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            {/* Stroke Gradients */}
                            <linearGradient id="colorMax" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#FB7185" />
                                <stop offset="100%" stopColor="#F472B6" />
                            </linearGradient>
                            <linearGradient id="colorMin" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>

                            {/* Area/Ray Gradients - Vertical Fade */}
                            <linearGradient id="colorMaxArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FB7185" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMinArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>

                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 13, fontFamily: 'JetBrains Mono' }}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            animationDuration={200}
                        />
                        <Area
                            type="monotone"
                            dataKey="max"
                            stroke="url(#colorMax)"
                            strokeWidth={3}
                            fill="url(#colorMaxArea)"
                            activeDot={{ r: 6, fill: '#F472B6', stroke: 'white', strokeWidth: 2 }}
                            filter="url(#glow)"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                        <Area
                            type="monotone"
                            dataKey="min"
                            stroke="url(#colorMin)"
                            strokeWidth={3}
                            fill="url(#colorMinArea)"
                            dot={(props: any) => {
                                if (props.payload.isPoint) {
                                    return (
                                        <circle cx={props.cx} cy={props.cy} r={5} fill="white" stroke="#38bdf8" strokeWidth={3} />
                                    )
                                }
                                return <></>;
                            }}
                            filter="url(#glow)"
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                            animationBegin={200}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-6 mt-6 ml-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
                    <span className="text-sm text-muted-foreground font-medium">Max Focus</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                    <span className="text-sm text-muted-foreground font-medium">Min Focus</span>
                </div>
            </div>
        </div>
    );
}
