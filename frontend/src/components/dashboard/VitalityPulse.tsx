import { motion } from 'framer-motion';
import { ArrowUpRight, Radio, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';

const MOCK_SIGNALS = [
    {
        id: 1,
        company: "TechFlow Inc",
        signal: "Followed competitor @Salesforce",
        source: "X / Twitter",
        time: "12m ago",
        vitality: 98,
        intent: "High Intent"
    },
    {
        id: 2,
        company: "Designify",
        signal: "Commented on 'Lead Gen' FB Ad",
        source: "Facebook Ads",
        time: "45m ago",
        vitality: 92,
        intent: "High Intent"
    },
    {
        id: 3,
        company: "Global Sourcing",
        signal: "Posted 'Looking for CRM'",
        source: "LinkedIn",
        time: "1h ago",
        vitality: 88,
        intent: "Active Search"
    }
];

export function VitalityPulse() {
    const [feed, setFeed] = useState(MOCK_SIGNALS);

    useEffect(() => {
        fetch('/api/vitality/feed')
            .then(res => res.json())
            .then(data => {
                if (data.feed && data.feed.length > 0) {
                    const mapped = data.feed.map((lead: any) => {
                        // Get latest signal or use default
                        const latestSignal = lead.signals?.[0] || {};
                        return {
                            id: lead.id,
                            company: lead.name,
                            signal: latestSignal.message || `Detected new activity in ${lead.city}`,
                            source: latestSignal.source || 'Bernard AI',
                            time: 'Just now', // Ideally calc relative time
                            vitality: lead.vitality_score,
                            intent: lead.vitality_badge === 'hot' ? 'High Intent' : 'Monitoring'
                        };
                    });
                    setFeed(mapped);
                }
            })
            .catch(() => {
                // Keep mock data on error/empty
            });
    }, []);

    return (
        <Card className="h-full border-white/5 bg-[#151921] backdrop-blur-xl relative overflow-hidden flex flex-col group">
            {/* Neon Glow on 'Hot' */}
            <div className={`absolute -inset-1 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-xl blur-xl transition-opacity duration-1000 ${feed.some(i => i.intent === 'High Intent') ? 'opacity-100' : 'opacity-20'}`} />

            {/* Header */}
            <div className="p-5 border-b border-border/10 flex justify-between items-center mb-2 z-10 relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center relative">
                        <Radio className="w-4 h-4 text-blue-400" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Vitality Pulse</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-400">Intent-First Signals</p>
                            <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" /> Reputation Safe
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] uppercase tracking-wider">
                        Warm Mode
                    </Badge>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar z-10 relative">
                {feed.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group/item p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Hover Beam Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent translate-x-[-100%] group-hover/item:animate-shimmer" />
                        </div>

                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-slate-200">{item.company}</span>
                            <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                            <span className="text-blue-400 font-medium mr-1">[{item.source}]</span>
                            {item.signal}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.vitality > 90 ? 'bg-emerald-500' : item.vitality > 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                        style={{ width: `${item.vitality}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold ${item.vitality > 90 ? 'text-emerald-400' : item.vitality > 70 ? 'text-blue-400' : 'text-orange-400'}`}>
                                    {item.vitality} Vitality
                                </span>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover/item:text-white transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Action - Orchestrate */}
            <div className="p-3 border-t border-border/10 bg-white/5 z-10 relative">
                <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10">
                    <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    Auto-Orchestrate <span className="text-slate-500 font-normal ml-1">(Human-in-Loop)</span>
                </button>
            </div>
        </Card>
    );
}
