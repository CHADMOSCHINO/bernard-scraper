import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Radio, Activity, Wifi } from 'lucide-react';

// Active scraping regions with live data
const SCRAPING_REGIONS = [
    { id: 1, x: 22, y: 32, label: 'New York', country: 'USA', leads: 42385, isActive: true, color: '#007BFF' },
    { id: 2, x: 18, y: 45, label: 'Los Angeles', country: 'USA', leads: 28450, isActive: true, color: '#00BFFF' },
    { id: 3, x: 48, y: 28, label: 'London', country: 'UK', leads: 18200, isActive: true, color: '#10B981' },
    { id: 4, x: 52, y: 32, label: 'Paris', country: 'France', leads: 12100, isActive: false, color: '#8B5CF6' },
    { id: 5, x: 55, y: 48, label: 'Dubai', country: 'UAE', leads: 8540, isActive: true, color: '#FFA500' },
    { id: 6, x: 72, y: 38, label: 'Singapore', country: 'SG', leads: 15200, isActive: true, color: '#FF69B4' },
    { id: 7, x: 78, y: 58, label: 'Sydney', country: 'AUS', leads: 9800, isActive: false, color: '#06B6D4' },
    { id: 8, x: 30, y: 68, label: 'São Paulo', country: 'Brazil', leads: 6540, isActive: true, color: '#22C55E' },
    { id: 9, x: 68, y: 32, label: 'Tokyo', country: 'Japan', leads: 21300, isActive: true, color: '#EF4444' },
    { id: 10, x: 45, y: 55, label: 'Mumbai', country: 'India', leads: 11200, isActive: true, color: '#F59E0B' },
];

export function WorldMap() {
    const [scanPosition, setScanPosition] = useState(0);
    const [totalLeads, setTotalLeads] = useState(0);

    // Calculate total leads
    useEffect(() => {
        const total = SCRAPING_REGIONS.reduce((sum, region) => sum + region.leads, 0);
        setTotalLeads(total);
    }, []);

    // Animate scan line
    useEffect(() => {
        const interval = setInterval(() => {
            setScanPosition(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-2xl bg-[#080A0F] border border-white/10 shadow-2xl">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,123,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,123,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Ambient Glow */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-cyan-500/5 rounded-full blur-[80px]" />

            {/* Scanning Line Effect */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/60 to-transparent z-20 pointer-events-none"
                style={{ left: `${scanPosition}%` }}
            />

            {/* World Map SVG */}
            <svg
                viewBox="0 0 1000 500"
                className="absolute inset-x-0 h-full w-full opacity-60"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#007BFF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#007BFF" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Simplified World Continents Outline - Scaled up for "Full" look */}
                <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" transform="scale(1.1) translate(-50, -20)">
                    {/* North America */}
                    <path d="M50,120 Q100,80 180,100 T280,120 T320,150 T280,200 T220,220 T160,200 T100,220 T50,180 Z" />
                    {/* South America */}
                    <path d="M180,260 Q220,250 250,280 T280,350 T250,400 T200,420 T160,380 T170,320 Z" />
                    {/* Europe */}
                    <path d="M420,100 Q480,80 540,100 T580,130 T560,170 T500,180 T440,160 T420,130 Z" />
                    {/* Africa */}
                    <path d="M440,200 Q500,180 540,220 T560,300 T520,380 T460,400 T420,360 T420,280 Z" />
                    {/* Asia */}
                    <path d="M560,100 Q650,60 750,100 T820,150 T800,220 T720,260 T620,240 T560,180 Z" />
                    {/* Australia */}
                    <path d="M720,320 Q780,300 840,330 T860,380 T820,420 T760,420 T720,380 Z" />
                </g>

                {/* Connection Lines between active regions */}
                <g stroke="rgba(0,123,255,0.15)" strokeWidth="1" strokeDasharray="4 4" fill="none">
                    <path d="M220,160 Q350,100 480,140" />
                    <path d="M480,140 Q550,200 550,240" />
                    <path d="M550,240 Q650,180 720,160" />
                    <path d="M720,160 Q800,250 780,290" />
                    <path d="M180,160 Q200,300 300,340" />
                </g>
            </svg>

            {/* Regional Beacons */}
            {SCRAPING_REGIONS.map((region) => (
                <motion.div
                    key={region.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: region.id * 0.1, type: 'spring' }}
                    className="absolute group cursor-pointer z-10"
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                >
                    {/* Background Pulse for Active Regions */}
                    {region.isActive && (
                        <>
                            <motion.div
                                className="absolute -inset-3 rounded-full"
                                style={{ backgroundColor: `${region.color}20` }}
                                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute -inset-5 rounded-full"
                                style={{ backgroundColor: `${region.color}10` }}
                                animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }}
                                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                            />
                        </>
                    )}

                    {/* Core Beacon */}
                    <div
                        className={`w-3 h-3 rounded-full border-2 transition-all ${region.isActive ? 'shadow-lg' : 'opacity-50'}`}
                        style={{
                            backgroundColor: region.isActive ? region.color : '#374151',
                            borderColor: region.isActive ? '#fff' : '#4B5563',
                            boxShadow: region.isActive ? `0 0 15px ${region.color}80` : 'none'
                        }}
                    />

                    {/* Hover Tooltip */}
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                        <div className="bg-[#111827]/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white">{region.label}</span>
                                <span className="text-[8px] text-slate-500 uppercase">{region.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-bold" style={{ color: region.color }}>
                                    {region.leads.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-500">leads</span>
                                {region.isActive && (
                                    <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                                )}
                            </div>
                            <div className={`text-[9px] mt-1 font-bold ${region.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                                {region.isActive ? '● LIVE SCRAPING' : '○ STANDBY'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* HUD Overlay - Top Left */}
            <div className="absolute top-4 left-4 z-20">
                <div className="bg-[#111827]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Global Coverage</div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">
                        {totalLeads.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Leads Extracted</div>
                </div>
            </div>

            {/* HUD Overlay - Top Right */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <div className="bg-[#111827]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
                </div>
                <div className="bg-[#111827]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                    <Wifi className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-mono text-slate-400">
                        {SCRAPING_REGIONS.filter(r => r.isActive).length} Active
                    </span>
                </div>
            </div>

            {/* HUD Overlay - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                <div className="bg-[#111827]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-400">ENCRYPTED FEED</span>
                </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/30 rounded-tl" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/30 rounded-br" />
        </div>
    );
}
