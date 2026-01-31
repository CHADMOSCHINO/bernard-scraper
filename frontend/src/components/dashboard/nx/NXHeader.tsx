import { useState } from 'react';
import { Search, Bell, User, Moon, Sun, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '@/lib/api';
import { useUser } from '@/contexts/UserContext';

interface NXHeaderProps {
    onMenuToggle?: () => void;
}

export function NXHeader({ onMenuToggle }: NXHeaderProps) {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(true);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const { profile } = useUser();

    const handleSearch = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && search) {
            setIsProcessing(true);
            try {
                // OpenAI Customized Search / AI Job Creation
                await api.createJobWithAI(search);
                alert('AI Agent Deployed: Scanning for ' + search);
                setSearch('');
            } catch (err: any) {
                alert('AI Error: ' + err.message);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Toggle Theme
    const toggleTheme = () => {
        setIsDark(!isDark);
        if (isDark) {
            // Switch to Light
            document.documentElement.classList.remove('dark');
            document.documentElement.style.setProperty('--background', '0 0% 100%');
            document.documentElement.style.setProperty('--card', '0 0% 100%');
            document.documentElement.style.setProperty('--foreground', '222.2 84% 4.9%');
        } else {
            // Switch to Dark
            document.documentElement.classList.add('dark');
            document.documentElement.style.removeProperty('--background');
            document.documentElement.style.removeProperty('--card');
            document.documentElement.style.removeProperty('--foreground');
        }
    };

    return (
        <header className="h-16 border-b border-[#1F2937] bg-[#0A0C14]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 transition-colors">
            {/* Left side: Menu toggle for mobile + Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}

                <div className="relative group w-full hidden sm:block">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-focus-within:opacity-75 transition duration-500"></div>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors z-10" />
                        <input
                            placeholder="Ask Chauncey to find leads..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            disabled={isProcessing}
                            className="w-full bg-[#0A0C14] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-transparent focus:ring-0 outline-none transition-all shadow-inner disabled:opacity-50 relative z-0"
                        />
                    </div>
                </div>
            </div>

            {/* Right Utilities */}
            <div className="flex items-center gap-2 lg:gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Toggle Theme"
                >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-orange-400" />}
                </button>
                <div className="h-6 w-px bg-[#1F2937] hidden lg:block" />

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 transition-colors relative group ${notificationsEnabled ? 'text-slate-400 hover:text-white' : 'text-slate-600'}`}
                        title={notificationsEnabled ? 'Notifications On' : 'Notifications Disabled'}
                    >
                        <Bell className={`w-4 h-4 ${!notificationsEnabled ? 'opacity-50' : ''}`} />
                        {notificationsEnabled && (
                            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[#FF69B4] rounded-full border border-[#0A0C14]"></span>
                        )}

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-72 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notifications</div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNotificationsEnabled(!notificationsEnabled);
                                            }}
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${notificationsEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}
                                        >
                                            {notificationsEnabled ? 'ACTIVE' : 'MUTED'}
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {!notificationsEnabled ? (
                                            <div className="py-8 text-center">
                                                <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-20" />
                                                <p className="text-[10px] text-slate-600">Notifications are muted</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                                    <div className="text-xs font-bold text-white mb-0.5">Scrape Complete</div>
                                                    <div className="text-[10px] text-slate-500">Google Maps scan finished with 420 leads.</div>
                                                    <div className="text-[8px] text-slate-700 mt-1 uppercase font-bold tracking-tighter">2 mins ago</div>
                                                </div>
                                                <div className="p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                                    <div className="text-xs font-bold text-white mb-0.5">System Update</div>
                                                    <div className="text-[10px] text-slate-500">Chauncey v2.5 is now active on all clusters.</div>
                                                    <div className="text-[8px] text-slate-700 mt-1 uppercase font-bold tracking-tighter">1 hour ago</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button className="w-full mt-3 py-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors border-t border-white/5">
                                        VIEW ALL ALERTS
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-2">
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#2D3748] flex items-center justify-center ring-2 ring-transparent hover:ring-[#007BFF]/30 transition-all cursor-pointer overflow-hidden group shadow-lg"
                        title="Profile Settings"
                    >
                        {profile.avatar.startsWith('http') || profile.avatar.startsWith('data:') ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                            <User className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
