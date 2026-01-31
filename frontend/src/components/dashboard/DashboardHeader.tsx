import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Search, User, Menu, X, Bell, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
    onOpenMissionControl?: () => void;
}

export function DashboardHeader({ onOpenMissionControl }: DashboardHeaderProps) {
    const { profile } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        // Initialize theme from local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            document.documentElement.classList.add('dark'); // Default to dark per cyber aesthetic
        }

        // Load notifications preference
        const savedNotifs = localStorage.getItem('notifications_enabled');
        if (savedNotifs !== null) {
            setNotificationsEnabled(savedNotifs === 'true');
        }

        // Keyboard shortcut for search (Cmd+K / Ctrl+K)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                searchInput?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    };

    const toggleNotifications = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        localStorage.setItem('notifications_enabled', String(newState));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setShowSearchResults(query.length > 0);
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between gap-4 py-3 px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
                {/* Left Side: Logo & Greeting */}
                <div className="flex items-center gap-4">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/src/assets/chauncey_logo.png" alt="Chauncey Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-foreground">Welcome, {profile.name.split(' ')[0]}</h1>
                        <p className="text-xs text-muted-foreground">{profile.role}</p>
                    </div>
                </div>

                {/* Center: Search (Hidden on small mobile) */}
                <div className="flex-1 max-w-xl px-4 w-full hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search leads, commands, or help..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-full py-2.5 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder:text-muted-foreground transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="text-[10px] bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">⌘K</span>
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showSearchResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 text-xs text-muted-foreground border-b border-border">
                                        Results for "{searchQuery}"
                                    </div>
                                    <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                                        {['Dashboard', 'Settings', 'Leads', 'Export'].filter(item =>
                                            item.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((result, i) => (
                                            <div key={i} className="p-2 rounded-lg hover:bg-secondary/50 cursor-pointer text-sm text-foreground">
                                                {result}
                                            </div>
                                        ))}
                                        {['Dashboard', 'Settings', 'Leads', 'Export'].filter(item =>
                                            item.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length === 0 && (
                                                <div className="p-4 text-center text-muted-foreground text-xs">No results found</div>
                                            )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3">
                    {/* Light/Dark Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Launch Mission Button - NEW */}
                    <button
                        onClick={onOpenMissionControl}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>Launch Mission</span>
                    </button>
                    <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notification Bell with Popover */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors group"
                        >
                            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            {notificationsEnabled && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-12 w-80 bg-popover border border-border shadow-2xl rounded-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                                        <span className="font-bold text-sm text-foreground">Notifications</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">{notificationsEnabled ? 'ON' : 'OFF'}</span>
                                            <button
                                                onClick={toggleNotifications}
                                                className={`w-8 h-4 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                            >
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: notificationsEnabled ? '18px' : '2px' }} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                        {notificationsEnabled ? (
                                            [1, 2, 3].map(i => (
                                                <div key={i} className="p-3 rounded-xl hover:bg-secondary/50 transition-colors flex gap-3 items-start">
                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-foreground font-medium">New leads extracted</p>
                                                        <p className="text-[10px] text-muted-foreground">Just now • Automated Scan</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground text-xs">
                                                Notifications are disabled.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border/50">
                        <div className="text-right hidden lg:block">
                            <div className="text-sm font-medium text-foreground">{profile.name}</div>
                            <div className="text-xs text-muted-foreground">{profile.plan}</div>
                        </div>
                        <button
                            className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center hover:ring-2 hover:ring-cyan-500/30 transition-all overflow-hidden"
                            onClick={() => window.location.href = '/settings'}
                        >
                            {profile.avatar && profile.avatar.startsWith('http') ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-xs text-white uppercase">{profile.name.substring(0, 2)}</span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-slate-950 border-r border-slate-800 z-50 p-6 md:hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <img src="/src/assets/chauncey_logo.png" alt="Chauncey" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-lg font-bold">Chauncey</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
                                    {['Dashboard', 'Leads', 'Scraper', 'Analytics', 'Settings'].map((item) => (
                                        <button key={item} className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white text-left transition-colors">
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{profile.name}</div>
                                            <div className="text-xs text-slate-500">{profile.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
