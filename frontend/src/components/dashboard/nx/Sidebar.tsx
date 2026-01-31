import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    Building2,
    Share2,
    LogOut,
    ChevronDown,
    Zap,
    Video,
    MessageSquare,
    Instagram,
    Mail,
    Rocket
} from 'lucide-react';

interface SidebarProps {
    onSelectView: (view: string | null) => void;
}

export function Sidebar({ onSelectView }: SidebarProps) {
    const { profile } = useUser();
    const [openCategory, setOpenCategory] = useState<string | null>('maps');

    const categories = [
        {
            id: 'maps',
            label: 'MAPS & LOCAL',
            icon: Database,
            items: ['Google Maps', 'Yelp', 'YellowPages'],
            isActive: true
        },
        {
            id: 'social',
            label: 'SOCIAL',
            icon: Share2,
            items: ['Facebook', 'Instagram', 'Twitter / X', 'TikTok'],
            comingSoon: true
        },
        {
            id: 'professional',
            label: 'PROFESSIONAL',
            icon: Building2,
            items: ['LinkedIn', 'Crunchbase'],
            comingSoon: true
        },
        {
            id: 'video',
            label: 'VIDEO',
            icon: Video,
            items: ['YouTube', 'TikTok Trends'],
            comingSoon: true
        },
        {
            id: 'forums',
            label: 'FORUMS',
            icon: MessageSquare,
            items: ['Reddit', 'Discord', 'Telegram', 'Pinterest'],
            comingSoon: true
        }
    ];

    return (
        <div className="w-64 h-full bg-[#0A0C14] border-r border-[#1F2937] flex flex-col flex-shrink-0">
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse" />
                        <img src="/logo.png" alt="Bernard" className="w-full h-full object-contain relative z-10" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Bernard</span>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={() => onSelectView(null)} // This will be caught by Dashboard to close
                    className="lg:hidden p-2 text-slate-500 hover:text-white"
                >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">

                <div className="mb-6">
                    <button
                        onClick={() => onSelectView(null)} // Standard Dashboard View
                        className="flex items-center gap-3 w-full px-4 py-3 bg-[#007BFF]/10 text-[#007BFF] rounded-xl text-sm font-bold border border-[#007BFF]/20 shadow-[0_0_15px_rgba(0,123,255,0.1)] hover:bg-[#007BFF]/20 transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                </div>

                {categories.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                        <button
                            onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all group ${(cat as any).comingSoon
                                ? 'text-slate-600 hover:text-slate-500 hover:bg-white/[0.02]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <cat.icon className={`w-4 h-4 transition-colors ${(cat as any).comingSoon ? 'text-slate-700' : 'text-slate-500 group-hover:text-[#00BFFF]'
                                    }`} />
                                <span className="text-xs font-bold tracking-wider">{cat.label}</span>
                                {(cat as any).comingSoon && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-bold bg-slate-800 text-slate-500 rounded uppercase">Soon</span>
                                )}
                                {(cat as any).isActive && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500/20 text-emerald-400 rounded uppercase">Active</span>
                                )}
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform ${openCategory === cat.id ? 'rotate-180 text-[#00BFFF]' : ''}`} />
                        </button>

                        {/* Dropdown Items */}
                        {openCategory === cat.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-11 space-y-1"
                            >
                                {cat.items.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => !(cat as any).comingSoon && onSelectView(item)}
                                        disabled={(cat as any).comingSoon}
                                        className={`block w-full text-left py-2 text-sm transition-all ${(cat as any).comingSoon
                                            ? 'text-slate-700 cursor-not-allowed'
                                            : 'text-slate-500 hover:text-[#00BFFF] hover:pl-2'
                                            }`}
                                    >
                                        {item}
                                        {(cat as any).comingSoon && (
                                            <span className="ml-2 text-[9px] text-slate-600">Coming Soon</span>
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Beta Email Subscription Card */}
            <div className="p-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1A2036] border border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    {/* Beta Badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-[8px] font-bold text-white uppercase tracking-wider animate-pulse">
                        BETA
                    </div>

                    <h4 className="text-white font-bold relative z-10 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" fill="#10B981" /> Early Access
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 relative z-10">
                        Get exclusive launch discounts & updates.
                    </p>

                    <div className="mt-3 space-y-2 relative z-10">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                        />
                        <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                            SUBSCRIBE FOR LAUNCH
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-600 mt-2 text-center relative z-10 flex items-center justify-center gap-1">
                        Free until official launch <Rocket className="w-2 h-2 text-emerald-500 animate-bounce" />
                    </p>
                </div>
            </div>

            {/* Developer / User Profile */}
            <div className="p-4 border-t border-[#1F2937] bg-black/20">
                <div className="mb-4 px-2">
                    <div className="text-sm font-bold text-white tracking-tight">{profile.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{profile.role || 'Neural Operator'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <a
                        href="https://instagram.com/chadmoschino"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all border border-white/5 hover:border-pink-500/20 group"
                    >
                        <Instagram className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-bold">Social</span>
                    </a>
                    <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-white/5 hover:border-cyan-500/20 group"
                    >
                        <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-bold">Contact</span>
                    </a>
                </div>

                <button
                    onClick={() => window.location.href = '/landing'}
                    className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-400 w-full py-2 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-3 h-3" />
                    DISCONNECT SESSION
                </button>
            </div>
        </div>
    );
}
