import { motion } from 'framer-motion';
import { Bot, Globe, MessageCircle } from 'lucide-react';

const timelineData = [
    { day: 'Mon', count: 124, status: 'hot', icon: Globe, source: 'G-Maps' },
    { day: 'Tue', count: 86, status: 'warm', icon: MessageCircle, source: 'Twitter' },
    { day: 'Wed', count: 202, status: 'hot', icon: Globe, source: 'G-Maps' },
    { day: 'Thu', count: 154, status: 'cold', icon: Bot, source: 'Auto' },
    { day: 'Fri', count: 98, status: 'warm', icon: MessageCircle, source: 'FB Ads' },
];

export function VitalityTimeline() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 relative space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {timelineData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-12 text-xs font-mono text-slate-500 text-right">{item.day}</div>
                        <div className="flex-1 bg-slate-800/50 rounded-full h-10 relative overflow-hidden flex items-center px-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.count / 250) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`absolute left-0 top-0 bottom-0 opacity-20 ${item.status === 'hot' ? 'bg-cyan-500' :
                                    item.status === 'warm' ? 'bg-pink-500' : 'bg-slate-500'
                                    }`}
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.count / 250) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`absolute left-0 bottom-0 h-0.5 ${item.status === 'hot' ? 'bg-cyan-400 blur-[2px]' :
                                    item.status === 'warm' ? 'bg-pink-400 blur-[2px]' : 'bg-slate-400'
                                    }`}
                            />

                            <div className="relative z-10 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'hot' ? 'bg-cyan-500/20 text-cyan-400' :
                                        item.status === 'warm' ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        <item.icon className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs font-medium text-white">{item.source}</span>
                                </div>
                                <span className="text-xs font-mono text-slate-300">{item.count} Leads</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
