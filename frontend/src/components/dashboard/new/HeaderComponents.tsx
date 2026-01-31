import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LayoutGrid, SlidersHorizontal, ChevronDown, Check, Menu, X } from 'lucide-react';

interface DashboardHeaderProps {
    onOpenMissionControl?: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function DashboardHeaderV2({ onOpenMissionControl, activeTab, onTabChange }: DashboardHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = ['Overview', 'Monitoring', 'Support', 'Search'];

    return (
        <header className="sticky top-0 z-50 flex flex-col bg-[#0F1117]/90 backdrop-blur-xl border-b border-white/5 transition-all">
            <div className="flex items-center justify-between py-4 px-4 md:px-6">
                {/* Left: Branding & Tabs */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src="/logo.png" alt="Bernard" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,123,255,0.5)] relative z-10" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white hidden md:block">Bernard</span>
                    </div>

                    <nav className="hidden lg:flex items-center bg-[#1A1F2E] p-1 rounded-full border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 relative overflow-hidden ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={onOpenMissionControl}
                        className="hidden sm:flex px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/30 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all items-center gap-2 group hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                        LAUNCH
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:bg-white group-hover:animate-ping" />
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                    <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0F1117] animate-pulse"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-2 border-l border-white/10 sm:border-none sm:pl-0">
                        <div className="text-right hidden xl:block">
                            <div className="text-xs font-bold text-white">Alex Morgan</div>
                            <div className="text-[10px] text-slate-500">Pro Admin</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center ring-2 ring-transparent hover:ring-blue-500/30 transition-all cursor-pointer">
                            <User className="w-4 h-4 text-slate-300" />
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden overflow-hidden bg-[#111827] border-t border-white/5"
                    >
                        <div className="p-4 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        onTabChange(tab);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    if (onOpenMissionControl) onOpenMissionControl();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors mt-2"
                            >
                                Launch Mission
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

function FilterDropdown({ label, options }: { label: string, options: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="px-3 py-1.5 rounded-full bg-[#1A1F2E] border border-white/5 text-xs font-medium text-slate-300 hover:border-blue-500/30 hover:text-white transition-colors flex items-center gap-2 min-w-[100px] justify-between group"
            >
                <span className="truncate">{label}: <span className="text-white">{selected}</span></span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-2 left-0 w-32 bg-[#1A1F2E] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-1"
                    >
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => {
                                    setSelected(opt);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[10px] font-medium rounded-lg flex items-center justify-between ${selected === opt ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {opt}
                                {selected === opt && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FilterRow() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(0,123,255,0.3)]">
                        COMMAND CENTER
                    </span>
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                    REAL-TIME ACQUISITION PROTOCOL • V1.1.0 • ONLINE
                </p>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex items-center gap-2 bg-[#1A1F2E] p-1 rounded-lg border border-white/5 shrink-0">
                    <button className="p-1.5 rounded-md bg-white/10 text-white shadow-sm">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white">
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <FilterDropdown label="Date" options={['Now', 'Today', 'Week', 'Month']} />
                    <FilterDropdown label="Product" options={['All', 'Maps', 'Social', 'Search']} />
                    <FilterDropdown label="Status" options={['Active', 'Paused', 'Error']} />
                </div>
            </div>
        </div>
    );
}
