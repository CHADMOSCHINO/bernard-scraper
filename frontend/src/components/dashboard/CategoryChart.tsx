import { ArrowDown, ArrowUp } from 'lucide-react';

const categories = [
    { name: 'Sport Skills', value: 71, trend: 'down', color: 'orange' },
    { name: 'Blogging', value: 92, trend: 'up', color: 'blue' },
    { name: 'Leadership', value: 33, trend: 'down', color: 'orange' },
    { name: 'Meditation', value: 56, trend: 'up', color: 'blue' },
    { name: 'Philosophy', value: 79, trend: 'up', color: 'blue' },
];

export function CategoryChart() {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Developed areas</h3>
                <p className="text-muted-foreground text-sm mb-4">Most common areas of interests</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">41%</span>
                    <span className="text-muted-foreground font-medium">Avg. Conc-ion</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-around gap-4 relative">
                {/* Gemini Insight Overlay (simulated for effect) */}
                <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-2 text-xs text-cyan-400/80 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Gemini: Focus on Blogging
                    </div>
                </div>

                {categories.map((cat) => (
                    <div key={cat.name} className="group flex items-center justify-between gap-4">
                        <span className="w-24 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{cat.name}</span>

                        <div className="flex-1 h-2.5 bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${cat.value}%`,
                                    background: cat.color === 'blue'
                                        ? 'linear-gradient(90deg, #3b82f6 0%, #22d3ee 100%)'
                                        : 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)',
                                    filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-16 justify-end">
                            <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors">{cat.value}%</span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${cat.trend === 'up' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                {cat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
