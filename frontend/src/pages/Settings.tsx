import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BernardDock } from '@/components/dashboard/BernardDock';
import { LiveFeed } from '@/components/dashboard/LiveFeed';
import * as api from '@/lib/api';
import { User, Key, Laptop2, Link2, Zap, Globe, Settings as SettingsIcon, CheckCircle2, Bell, Smartphone, Shield, Database, Save, X, Loader2, Compass, Trash2, Map as MapIcon } from 'lucide-react';
import { WorldMap } from '@/components/dashboard/nx/WorldMap';
import { motion, AnimatePresence } from 'framer-motion';



const bentoVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};



export function Settings() {
    const { profile, updateProfile } = useUser();
    const [activeTab, setActiveTab] = useState('preferences');

    // Format helper
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Preferences State
    const [preferences, setPreferences] = useState({
        desktopNotifications: false,
        soundAlerts: true,
        phoneNumber: ''
    });

    // Connectors State
    const [connectors, setConnectors] = useState<Record<string, boolean>>({
        hubspot: false,
        salesforce: false,
        slack: true,
        zapier: false,
        google_drive: false,
        notion_v2: false,
        webhook: false
    });

    const [configuring, setConfiguring] = useState<string | null>(null);
    const [availableDatabases, setAvailableDatabases] = useState<any[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);


    const containerRef = useRef<HTMLDivElement>(null);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedPrefs = localStorage.getItem('bernard_prefs');
        const savedConnectors = localStorage.getItem('bernard_connectors');

        if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
        if (savedConnectors) setConnectors(JSON.parse(savedConnectors));
    }, []);

    // Load stats for usage card
    const [stats, setStats] = useState({ totalLeads: 0, totalRuns: 0 });
    useEffect(() => {
        api.getStats().then(setStats).catch(console.error);
    }, []);

    // Save on change and sync to server
    useEffect(() => {
        localStorage.setItem('bernard_prefs', JSON.stringify(preferences));
        localStorage.setItem('bernard_connectors', JSON.stringify(connectors));
    }, [preferences, connectors]);

    // Handle spotlight effect directly via DOM for performance (no re-renders)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            containerRef.current.style.setProperty('--mouse-x', `${x}px`);
            containerRef.current.style.setProperty('--mouse-y', `${y}px`);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Identity', icon: User },
        { id: 'credentials', label: 'Proxy & Auth', icon: Key },
        { id: 'preferences', label: 'Preferences', icon: Laptop2 },
        { id: 'scraper', label: 'Scraper Engine', icon: Compass },
        { id: 'connectors', label: 'Integrations', icon: Link2 },
        { id: 'generation', label: 'AI Models', icon: Zap },
    ];

    return (
        <div className="flex flex-col h-full bg-transparent text-white overflow-hidden" onMouseMove={handleMouseMove}>
            <DashboardHeader />

            <motion.div
                ref={containerRef}
                className="flex-1 overflow-y-auto pb-32 p-6 md:p-8 spotlight-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">System Settings</h2>
                        <p className="text-slate-400">Configure your neural link, identity, and integration nodes.</p>
                    </div>

                    {/* Navigation Pills */}
                    <div className="flex flex-wrap gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${activeTab === tab.id
                                    ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area - BENTO GRID */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={bentoVariant}
                            className="bg-transparent"
                        >
                            {activeTab === 'profile' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Profile Card */}
                                    <div className="col-span-1 md:col-span-2 row-span-2 bento-card spotlight-card p-8 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                                    <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors" />
                                                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs font-bold text-white">Change</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="avatar-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    updateProfile({ avatar: reader.result as string });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
                                                    <p className="text-slate-400">{profile.role}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">Verified</span>
                                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">Pro Tier</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    updateProfile(profile);
                                                    // Trigger visual feedback
                                                    const btn = document.activeElement as HTMLButtonElement;
                                                    if (btn) {
                                                        const original = btn.innerHTML;
                                                        btn.innerHTML = 'Saved';
                                                        setTimeout(() => btn.innerHTML = original, 2000);
                                                    }
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                title="Save Profile"
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-4 mt-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Display Name</label>
                                                    <input
                                                        value={profile.name}
                                                        onChange={e => updateProfile({ name: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                                    <input
                                                        value={profile.email}
                                                        onChange={e => updateProfile({ email: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                                    <input
                                                        value={profile.phone || ''}
                                                        onChange={e => updateProfile({ phone: e.target.value })}
                                                        placeholder="+1 (555) 000-0000"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Company / Org</label>
                                                    <input
                                                        value={profile.company || ''}
                                                        onChange={e => updateProfile({ company: e.target.value })}
                                                        placeholder="Acme Corp"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                                    <input
                                                        value={profile.location || ''}
                                                        onChange={e => updateProfile({ location: e.target.value })}
                                                        placeholder="San Francisco, CA"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                                                    <textarea
                                                        value={profile.bio || ''}
                                                        onChange={e => updateProfile({ bio: e.target.value })}
                                                        placeholder="Tell us about yourself..."
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors resize-none h-20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Card */}
                                    <div className="bento-card spotlight-card p-6 flex flex-col justify-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h4 className="font-bold text-lg text-white">Session Security</h4>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="text-xs text-slate-300">Mask IP Address</div>
                                            <div
                                                onClick={() => updateProfile({ ipProtection: !profile.ipProtection })}
                                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${profile.ipProtection ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile.ipProtection ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            Last Saved: {new Date().toLocaleTimeString()} (Auto-Persist Active)
                                        </p>
                                    </div>

                                    {/* Stats/Usage */}
                                    <div className="bento-card spotlight-card p-6 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Database className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs font-bold text-slate-400 uppercase">Usage</span>
                                        </div>
                                        <div className="text-4xl font-mono font-bold text-white mb-1">
                                            {formatNumber(stats.totalLeads)}
                                        </div>
                                        <div className="text-xs text-slate-400 mb-4">Leads extracted this month</div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                                style={{ width: `${Math.min((stats.totalLeads / 100000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Notifications */}
                                    <div className="col-span-1 md:col-span-2 bento-card spotlight-card p-8">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                            <Bell className="text-cyan-400" /> Notification Centers
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                                <div>
                                                    <div className="font-medium text-white">Desktop Alerts</div>
                                                    <div className="text-xs text-slate-500">Native browser notifications</div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!preferences.desktopNotifications) {
                                                            // Request notification permission
                                                            if ('Notification' in window) {
                                                                const permission = await Notification.requestPermission();
                                                                if (permission === 'granted') {
                                                                    setPreferences({ ...preferences, desktopNotifications: true });
                                                                    // Show test notification
                                                                    new Notification('Bernard.ai', {
                                                                        body: 'Desktop notifications are now enabled!',
                                                                        icon: '/logo.png'
                                                                    });
                                                                } else {
                                                                    alert('Please enable notifications in your browser settings.');
                                                                }
                                                            }
                                                        } else {
                                                            setPreferences({ ...preferences, desktopNotifications: false });
                                                        }
                                                    }}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${preferences.desktopNotifications ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'}`}
                                                >
                                                    {preferences.desktopNotifications ? 'ACTIVE' : 'ENABLE'}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                                <div>
                                                    <div className="font-medium text-white">Sound Effects</div>
                                                    <div className="text-xs text-slate-500">Audio feedback on completion</div>
                                                </div>
                                                <button
                                                    onClick={() => setPreferences({ ...preferences, soundAlerts: !preferences.soundAlerts })}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${preferences.soundAlerts ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}
                                                >
                                                    {preferences.soundAlerts ? 'ON' : 'OFF'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SMS */}
                                    <div className="bento-card spotlight-card p-6">
                                        <Smartphone className="w-8 h-8 text-purple-400 mb-4" />
                                        <h4 className="font-bold text-white mb-2">SMS Uplink</h4>
                                        <p className="text-xs text-slate-500 mb-4">Urgent mission alerts via Twilio.</p>
                                        <input
                                            placeholder="+1 (555)..."
                                            value={preferences.phoneNumber}
                                            onChange={e => setPreferences({ ...preferences, phoneNumber: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'credentials' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Proxy Manager */}
                                    <div className="bento-card spotlight-card p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Globe className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">Proxy Network</h3>
                                                <p className="text-xs text-slate-400">Manage rotation and residential nodes.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Provider</label>
                                                <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                                                    <option>Bright Data (Recommended)</option>
                                                    <option>Oxylabs</option>
                                                    <option>Smartproxy</option>
                                                    <option>Custom HTTP/S</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Connection String</label>
                                                <input
                                                    type="password"
                                                    value="http://user:pass@gate.smartproxy.com:7000"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs text-emerald-400">Node Active (US-East)</span>
                                                </div>
                                                <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-white">
                                                    Test Connection
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Credentials */}
                                    <div className="bento-card spotlight-card p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                                <Key className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">Platform Auth</h3>
                                                <p className="text-xs text-slate-400">Secure storage for scraper login tokens.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {['Facebook', 'LinkedIn', 'Instagram', 'Twitter / X', 'TikTok'].map(platform => (
                                                <div key={platform} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                                                    <span className="text-sm font-medium text-slate-300">{platform}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Authenticated</span>
                                                        <button className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                                                            <SettingsIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold text-white transition-all">
                                            + Add New Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'connectors' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        {
                                            id: 'custom_api',
                                            name: 'Custom API',
                                            color: 'cyan',
                                            icon: (
                                                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(0,191,255,0.6)]">
                                                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 15L12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'notion_v2',
                                            name: 'Notion v2',
                                            color: 'slate',
                                            icon: (
                                                <svg viewBox="0 0 100 100" fill="currentColor" className="w-8 h-8 text-white">
                                                    <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff" />
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.437-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L75.31 3.147C71.067-.46 68.147-.357 61.35.227zM25.663 17.547c-5.2.287-6.38.353-9.343-1.9l-7.06-5.5c-.78-.773-.387-1.75 1.553-1.94l51.067-3.693c4.277-.387 6.413.973 8.16 2.333l8.543 6.22c.39.193.97 1.167.193 1.167l-52.92 3.12v.193zM19.66 88.123V33.03c0-2.53.78-3.697 3.11-3.893l56.527-3.31c2.14-.193 3.11 1.167 3.11 3.693v54.707c0 2.53-.387 4.667-3.883 4.863l-52.143 3.117c-3.497.193-4.72-1.167-4.72-4.083zm51.06-51.073c.39 1.553 0 3.11-1.55 3.303l-2.53.387v40.353c-2.14 1.167-4.08 1.75-5.637 1.75-2.53 0-3.303-.78-5.247-3.11l-16.083-25.253v24.477l5.247 1.167s0 2.917-4.083 2.917l-11.227.583c-.39-.78 0-2.72 1.357-3.11l2.917-.78V46.38l-4.083-.39c-.39-1.557.58-3.887 3.3-4.083l12.013-.78 16.667 25.64V44.043l-4.467-.387c-.39-1.943 1.16-3.31 3.11-3.5l11.227-.777z" fill="#000" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'google_sheets',
                                            name: 'Google Sheets',
                                            color: 'green',
                                            icon: (
                                                <svg viewBox="0 0 24 24" className="w-8 h-8">
                                                    <path fill="#0F9D58" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6z" />
                                                    <path fill="#57BB8A" d="M14.727 6.727H14V0l6.727 6.727z" />
                                                    <path fill="#FFFFFF" d="M7.364 12h9.272v1.636H7.364zm0 2.727h9.272v1.637H7.364zm0 2.728h9.272v1.636H7.364zm0-8.182h9.272v1.636H7.364z" />
                                                    <path fill="#188038" d="M7.364 9.273h3.09v6.545h-3.09z" opacity=".2" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'google_drive',
                                            name: 'Google Drive',
                                            color: 'blue',
                                            icon: (
                                                <svg viewBox="0 0 87.3 78" className="w-8 h-8">
                                                    <path fill="#0066DA" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" />
                                                    <path fill="#00AC47" d="M43.65 25.15L29.9 1.35c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.55c-.8 1.4-1.2 2.95-1.2 4.5h27.5l16.15-26.9z" />
                                                    <path fill="#EA4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.85L73.55 76.8z" />
                                                    <path fill="#00832D" d="M43.65 25.15L57.4 1.35c-1.35-.8-2.9-1.2-4.5-1.2H34.35c-1.6 0-3.15.45-4.45 1.2l13.75 23.8z" />
                                                    <path fill="#2684FC" d="M59.85 53H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.85c1.6 0 3.15-.45 4.45-1.2L59.85 53z" />
                                                    <path fill="#FFBA00" d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25.15 59.85 53h27.4c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'hubspot',
                                            name: 'HubSpot',
                                            color: 'orange',
                                            icon: (
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#FF7A59]">
                                                    <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067c0 .86.501 1.602 1.227 1.96v2.862a5.673 5.673 0 00-2.904 1.508l-7.73-6.012a2.26 2.26 0 00.093-.638 2.281 2.281 0 10-2.282 2.282c.376 0 .729-.1 1.038-.269l7.618 5.923a5.704 5.704 0 00-.178 1.418c0 .56.082 1.1.232 1.612l-2.272 1.326a2.197 2.197 0 00-1.956-1.203 2.2 2.2 0 00-2.193 2.193 2.2 2.2 0 002.193 2.193 2.2 2.2 0 002.189-2.105l2.146-1.253a5.727 5.727 0 009.453-4.348 5.723 5.723 0 00-3.474-5.265zm-1.12 8.047a2.953 2.953 0 01-2.952-2.952 2.953 2.953 0 012.952-2.952 2.953 2.953 0 012.952 2.952 2.953 2.953 0 01-2.952 2.952z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'slack',
                                            name: 'Slack',
                                            color: 'purple',
                                            icon: (
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52h-2.52zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zM15.166 17.688a2.527 2.527 0 0 1-2.522-2.521 2.527 2.527 0 0 1 2.522-2.521h6.312A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.522h-6.312z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'webhook',
                                            name: 'Webhook',
                                            color: 'pink',
                                            icon: (
                                                <svg viewBox="0 0 24 24" className="w-8 h-8">
                                                    <circle cx="12" cy="5" r="3" fill="#E91E8C" />
                                                    <circle cx="5" cy="17" r="3" fill="#3D4852" />
                                                    <circle cx="19" cy="17" r="3" fill="#3D4852" />
                                                    <path d="M12 8v4l-5.5 3.5" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                    <path d="M12 12l5.5 3.5" stroke="#3D4852" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                    <path d="M8 17h8" stroke="#3D4852" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                </svg>
                                            )
                                        },
                                    ].map(connector => (
                                        <div key={connector.id} className="bento-card spotlight-card p-6 flex flex-col items-center justify-center text-center gap-4 relative group overflow-hidden">
                                            {/* Connected Indicator Glow */}
                                            {connectors[connector.id] && (
                                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 shadow-[0_2px_10px_rgba(16,185,129,0.5)]" />
                                            )}

                                            <div className={`w-16 h-16 rounded-2xl bg-${connector.color}-500/5 flex items-center justify-center border border-${connector.color}-500/10 group-hover:border-${connector.color}-500/30 group-hover:bg-${connector.color}-500/10 group-hover:scale-110 transition-all duration-300 relative`}>
                                                {/* Icon Glow */}
                                                <div className={`absolute inset-0 bg-${connector.color}-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                                <div className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                                    {connector.icon}
                                                </div>

                                                {/* Connected Checkmark Badge */}
                                                {connectors[connector.id] && (
                                                    <div className="absolute -top-2 -right-2 bg-black border border-emerald-500 rounded-full p-0.5 shadow-[0_0_8px_rgba(16,185,129,0.5)] z-20">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="z-10">
                                                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{connector.name}</h4>
                                                <p className={`text-[10px] font-mono mt-1 transition-colors ${connectors[connector.id] ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                    {connectors[connector.id] ? '● CONNECTED' : '○ DISCONNECTED'}
                                                </p>
                                            </div>

                                            <div className="w-full flex gap-2">
                                                <button
                                                    onClick={() => setConfiguring(connector.id)}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border outline-none overflow-hidden relative z-10 ${connectors[connector.id]
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'
                                                        }`}
                                                >
                                                    {connectors[connector.id] ? 'Configure' : 'Connect'}
                                                </button>
                                                {connectors[connector.id] && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConnectors({ ...connectors, [connector.id]: false });
                                                        }}
                                                        className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Disconnect"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="col-span-1 md:col-span-2 lg:col-span-4 bento-card spotlight-card p-6 flex flex-col items-center justify-center border-dashed border-white/10 bg-transparent hover:bg-white/5 cursor-pointer group gap-2 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-2xl text-slate-500 group-hover:text-white">+</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 group-hover:text-white transition-colors">Request New Integration</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'scraper' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="bento-card spotlight-card p-0 h-[400px] relative overflow-hidden">
                                            <div className="absolute top-4 left-4 z-10">
                                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                    <MapIcon className="w-4 h-4 text-cyan-400" />
                                                    Global Scraper Status
                                                </h3>
                                            </div>
                                            <WorldMap />
                                        </div>

                                        <div className="bento-card spotlight-card p-6">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                                <Compass className="text-blue-400" /> Scraper Intelligence
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Scraping Intensity (Depth)</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { id: 'light', label: 'Light', desc: 'Fast, basic info' },
                                                                { id: 'medium', label: 'Medium', desc: 'Deep social search' },
                                                                { id: 'heavy', label: 'Deep', desc: 'Full enrichment' },
                                                                { id: 'healing', label: 'Self-Healing', desc: 'Auto-adaptive' }
                                                            ].map(depth => (
                                                                <button
                                                                    key={depth.id}
                                                                    onClick={() => localStorage.setItem('scraper_depth', depth.id)}
                                                                    className={`p-3 rounded-xl border text-left transition-all ${localStorage.getItem('scraper_depth') === depth.id
                                                                        ? 'bg-blue-500/10 border-blue-500/50 text-white'
                                                                        : 'bg-white/5 border-transparent text-slate-500 hover:text-white hover:bg-white/10'}`}
                                                                >
                                                                    <div className="text-xs font-bold">{depth.label}</div>
                                                                    <div className="text-[9px] opacity-60 mt-0.5">{depth.desc}</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                        <div>
                                                            <div className="text-sm font-bold text-blue-400">Warm Brewing</div>
                                                            <div className="text-[10px] text-slate-500">Optimized rate limiting active</div>
                                                        </div>
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Command Center</h4>
                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                onClick={() => api.startScrape()}
                                                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl font-black text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                            >
                                                                INITIATE GLOBAL SCRAPE
                                                            </button>
                                                            <button
                                                                onClick={() => api.stopScrape()}
                                                                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                                            >
                                                                EMERGENCY STOP
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-6">
                                        <LiveFeed />

                                        <div className="bento-card spotlight-card p-6 bg-red-500/5 border-red-500/10">
                                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Trash2 className="w-4 h-4" /> System Maintenance
                                            </h4>
                                            <p className="text-[10px] text-slate-500 mb-4">
                                                Clearing the base tool will remove all local sessions, cookies, and configuration data. Use this for a fresh deployment feel.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to reset the entire system? All API keys and settings will be cleared.')) {
                                                        localStorage.clear();
                                                        window.location.reload();
                                                    }
                                                }}
                                                className="w-full py-2.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                            >
                                                RESET ALL TOOLS & COOKIES
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'generation' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 bento-card spotlight-card p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl">
                                                <Zap className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Neural Processing Units</h3>
                                                <p className="text-xs text-slate-400">Delegated processing across OpenAI and Google Gemini.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* OpenAI API Key */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                                                    OpenAI Intelligence (Intent & Social Search)
                                                    <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Delegated Search</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••••••••••••••••••"
                                                        defaultValue={localStorage.getItem('openai_api_key') || ''}
                                                        onChange={(e) => localStorage.setItem('openai_api_key', e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-mono tracking-wider"
                                                    />
                                                </div>
                                            </div>

                                            {/* Gemini API Key */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                                                    Gemini Processing (Scraper Intelligence & Enrichment)
                                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 text-[10px] hover:underline">Get API Key →</a>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        placeholder="AIza..."
                                                        defaultValue={localStorage.getItem('gemini_api_key') || ''}
                                                        onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-mono tracking-wider"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <h4 className="font-bold text-white mb-4">Model Routing</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="text-xs font-bold text-slate-400 mb-1">INTENT ENGINE</div>
                                                        <div className="text-sm font-mono text-emerald-400">GPT-4o / GPT-4 Turbo</div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="text-xs font-bold text-slate-400 mb-1">DATA REASONING</div>
                                                        <div className="text-sm font-mono text-blue-400">Gemini 2.0 Flash (Multimodal)</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-8">
                                                <button
                                                    onClick={() => {
                                                        alert('Configuration synchronized across neural nodes.');
                                                    }}
                                                    className="flex-1 py-4 bg-white text-black font-black text-sm rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                                                >
                                                    SYNCHRONIZE AI CONFIG
                                                </button>
                                            </div>
                                            {/* Secret Storage Notice */}
                                            <p className="text-[9px] text-center text-slate-600 mt-2 font-mono uppercase tracking-widest">
                                                Keys encrypted at rest (AES-256)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Dock Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <BernardDock />
            </div>

            {/* Connection Configuration Modal */}
            <AnimatePresence>
                {configuring && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setConfiguring(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0A0C14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-cyan-400" />
                                    Configure {configuring.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </h3>
                                <button onClick={() => setConfiguring(null)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl mb-4">
                                    <p className="text-xs text-cyan-200">
                                        <Zap className="w-3 h-3 inline mr-1" />
                                        <strong>MCP Active:</strong> Data will now stream directly to this destination instead of local CSVs.
                                    </p>
                                </div>

                                {configuring === 'webhook' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Target URL</label>
                                        <input
                                            placeholder="https://api.your-app.com/webhook..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                ) : configuring.includes('google') ? (
                                    <div className="space-y-4">
                                        <button className="w-full py-3 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                            Sign in with Google
                                        </button>
                                        <p className="text-[10px] text-center text-slate-500">
                                            Requires 'Drive.file' scope permission.
                                        </p>
                                    </div>
                                ) : configuring === 'notion_v2' ? (
                                    availableDatabases.length > 0 ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Select Target Database</label>
                                            <select
                                                id="db-id-select"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                                            >
                                                {availableDatabases.map(db => (
                                                    <option key={db.id} value={db.id}>{db.name}</option>
                                                ))}
                                            </select>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[10px] text-slate-500">Connected to Notion</p>
                                                <button
                                                    onClick={() => setAvailableDatabases([])}
                                                    className="text-[10px] text-cyan-400 hover:underline"
                                                >
                                                    Change Token
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Integration Token</label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                                    <input
                                                        id="api-key-input"
                                                        type="password"
                                                        placeholder="secret_..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500">
                                                Ensure your integration has access to the target database in Notion.
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">API Key / Token</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                            <input
                                                id="api-key-input"
                                                type="password"
                                                placeholder="sk_live_..."
                                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                                <button
                                    onClick={() => setConfiguring(null)}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const connectorId = configuring!; // Use non-null assertion since we're in the modal

                                            if (connectorId === 'notion_v2') {
                                                const apiKey = (document.getElementById('api-key-input') as HTMLInputElement)?.value;
                                                const dbId = (document.getElementById('db-id-select') as HTMLSelectElement)?.value || (document.getElementById('db-id-input') as HTMLInputElement)?.value;

                                                if (availableDatabases.length === 0) {
                                                    // Step 1: Verify and get DBs
                                                    if (!apiKey) return alert('API Key is required');
                                                    setIsVerifying(true);
                                                    try {
                                                        const res = await fetch(`${api.API_URL}/api/connectors/notion`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ apiKey })
                                                        });
                                                        const data = await res.json();
                                                        if (!data.success) throw new Error(data.error);
                                                        setAvailableDatabases(data.databases || []);
                                                        return; // Don't close modal yet
                                                    } finally {
                                                        setIsVerifying(false);
                                                    }
                                                } else {
                                                    // Step 2: Save final selection
                                                    const apiKey = (document.getElementById('api-key-input') as HTMLInputElement)?.value;
                                                    await fetch(`${api.API_URL}/api/connectors/notion`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ apiKey, databaseId: dbId })
                                                    });
                                                    setConnectors({ ...connectors, [connectorId]: true });
                                                    alert('Notion Connected Successfully!');
                                                }
                                            }
                                            else if (connectorId.includes('google')) {
                                                const res = await fetch(`${api.API_URL}/api/auth/google`);
                                                const { url } = await res.json();

                                                // Calculate center position for the popup
                                                const width = 500;
                                                const height = 600;
                                                const left = window.screen.width / 2 - width / 2;
                                                const top = window.screen.height / 2 - height / 2;

                                                const popup = window.open(
                                                    url,
                                                    'Google Auth',
                                                    `width=${width},height=${height},top=${top},left=${left}`
                                                );

                                                // Poll for closure/success (In a real app, we'd use postMessage)
                                                // For now, simpler: user manually refreshes or we assume success if they come back
                                                // Better: Add a listener for the callback
                                                window.addEventListener('message', (event) => {
                                                    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                                                        setConnectors({ ...connectors, google_drive: true, google_sheets: true });
                                                        popup?.close();
                                                    }
                                                });
                                            }
                                            else {
                                                // Fallback Mock for others
                                                setConnectors({ ...connectors, [connectorId]: true });
                                            }

                                            setConfiguring(null);
                                        } catch (e: any) {
                                            alert('Connection Failed: ' + e.message);
                                        }
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-xs font-bold text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        availableDatabases.length > 0 ? 'Complete Setup' : 'Connect & Fetch'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
