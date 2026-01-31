import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Zap, Shield, Sparkles, Database, Users, MessageSquare, Target, Camera, Play, Video, Share2, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import * as api from '@/lib/api';

interface MissionControlProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MissionControl({ isOpen, onClose }: MissionControlProps) {
    const [mode, setMode] = useState<'cold' | 'warm'>('warm');
    const [army, setArmy] = useState<string[]>(['gmaps', 'competitor']);
    const [agentEnabled, setAgentEnabled] = useState(true);

    const toggleSource = (id: string) => {
        setArmy(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
                    >
                        <Card className="w-full max-w-4xl max-h-[90vh] bg-[#0B0E14] border-slate-800 shadow-2xl flex flex-col pointer-events-auto overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-gradient-to-r from-slate-900 to-[#0B0E14]">
                                <div>
                                    <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-400" />
                                        MISSION CONTROL
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Configure your autonomous lead acquisition strategy.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* COL 1: STRATEGY */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Targeting Mode
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                            <button
                                                onClick={() => setMode('warm')}
                                                className={`py-3 px-4 rounded-lg text-sm font-bold transition-all flex flex-col items-center gap-1 ${mode === 'warm'
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <span>Warm Intent</span>
                                                <span className="text-[10px] font-normal opacity-80">Competitor Followers</span>
                                            </button>
                                            <button
                                                onClick={() => setMode('cold')}
                                                className={`py-3 px-4 rounded-lg text-sm font-bold transition-all flex flex-col items-center gap-1 ${mode === 'cold'
                                                    ? 'bg-slate-700 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <span>Cold Broad</span>
                                                <span className="text-[10px] font-normal opacity-80">Volume Scraping</span>
                                            </button>
                                        </div>
                                    </section>

                                    <AnimatePresence>
                                        {mode === 'warm' && (
                                            <motion.section
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <label className="text-sm font-medium text-blue-400 mb-2 block">Competitor Domain / Twitter Handle</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="@competitor or domain.com"
                                                        className="w-full bg-[#151921] border border-blue-500/30 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-2 ml-1">
                                                    We'll scrape their followers and ad comments.
                                                </p>
                                            </motion.section>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* COL 2: SCRAPER ARMY */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Database className="w-4 h-4" /> Scraper Army
                                    </h3>

                                    <div className="space-y-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {[
                                            { id: 'gmaps', label: 'Google Maps', icon: Globe, desc: 'Base location data', category: 'Maps', available: true },
                                            { id: 'yelp', label: 'Yelp', icon: Database, desc: 'Local business listings', category: 'Maps', available: true },
                                            { id: 'crunchbase', label: 'Crunchbase', icon: Building2, desc: 'Tech Startup Data', category: 'Pro', available: true },
                                            { id: 'linkedin', label: 'LinkedIn', icon: Users, desc: 'Profiles & Companies', category: 'Pro', available: false },
                                            { id: 'instagram', label: 'Instagram', icon: Camera, desc: 'Hashtags & Followers', category: 'Social', available: false },
                                            { id: 'facebook', label: 'Facebook', icon: Share2, desc: 'Groups & Pages', category: 'Social', available: false },
                                            { id: 'twitter', label: 'X / Twitter', icon: MessageSquare, desc: 'Advanced Search', category: 'Social', available: false },
                                            { id: 'tiktok', label: 'TikTok', icon: Video, desc: 'Trends & Comments', category: 'Video', available: false },
                                            { id: 'youtube', label: 'YouTube', icon: Play, desc: 'Channel Metadata', category: 'Video', available: false },
                                            { id: 'reddit', label: 'Reddit', icon: MessageSquare, desc: 'Subreddit Discussions', category: 'Forums', available: false },
                                        ].map(source => (
                                            <div
                                                key={source.id}
                                                onClick={() => source.available && toggleSource(source.id)}
                                                className={`p-3 rounded-xl border transition-all flex items-center gap-3 group ${!source.available ? 'opacity-40 cursor-not-allowed border-transparent grayscale' : 'cursor-pointer hover:bg-white/10'} ${army.includes(source.id) && source.available
                                                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                    : source.available ? 'bg-white/5 border-transparent' : ''
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${army.includes(source.id) && source.available ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                    <source.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-medium ${army.includes(source.id) && source.available ? 'text-white' : 'text-slate-400'}`}>{source.label}</span>
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${source.available ? 'bg-white/5 text-slate-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {source.available ? source.category : 'Wait'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">{source.available ? source.desc : 'Releasing in next update'}</p>
                                                </div>
                                                {source.available && (
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${army.includes(source.id) ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}`}>
                                                        {army.includes(source.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Scrape Depth Selector */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Scrape Depth</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Light', 'Medium', 'Deep'].map((depth) => (
                                                <button
                                                    key={depth}
                                                    className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white border border-transparent hover:border-white/10 transition-all focus:bg-blue-500/20 focus:text-blue-400 focus:border-blue-500/50"
                                                >
                                                    {depth}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* COL 3: AGENT & ACTIONS */}
                                <div className="space-y-8 bg-white/5 rounded-2xl p-6 border border-white/5 h-fit">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-400" /> Autonomous Agent
                                        </h3>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-slate-400">Self-Healing Mode</span>
                                            <button
                                                onClick={() => setAgentEnabled(!agentEnabled)}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${agentEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${agentEnabled ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Gemini 3 Pro will monitor scraper health, rotate IPs, and auto-correct search terms if yield is low.
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Shield className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-mono text-emerald-400">REPUTATION SAFEGUARD ACTIVE</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.startScrape();
                                                    alert('Neural Engine Activated. Scraping initiated across all clusters.');
                                                    onClose();
                                                } catch (e) {
                                                    alert('Failed to launch: ' + e);
                                                }
                                            }}
                                            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                                            Launch Campaign
                                        </button>
                                        <p className="text-[10px] text-center text-slate-500 mt-3">
                                            Estimated Yield: ~150 Warm Leads/hr
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
