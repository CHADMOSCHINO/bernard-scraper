import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layout, Smartphone, Search, Zap, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
            {/* Background Noise & Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/src/assets/chauncey_logo.png" alt="Chauncey" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Chauncey</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Products</a>
                    <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button>
                    <a href="#" className="hover:text-white transition-colors">Blog</a>
                    <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 rounded-full bg-white text-slate-950 text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
                    >
                        Access Chauncey
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Column: Copy & Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col gap-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-mono w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Gemini 3 Pro Integrated
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                        Simplifying <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200">Lead Gen</span> Through <br />
                        Smart Software
                    </h1>

                    <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                        From scraped maps to prioritized lists, our AI-driven software helps you automate outreach and boost productivity.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                        >
                            Try for Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-full font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Book a Free Consultation
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/50">
                        <div>
                            <div className="text-3xl font-bold font-mono">10k+</div>
                            <div className="text-xs text-slate-500 mt-1">Trusted by businesses</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold font-mono">45%</div>
                            <div className="text-xs text-slate-500 mt-1">Efficiency boost</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold font-mono">99.9%</div>
                            <div className="text-xs text-slate-500 mt-1">Uptime guarantee</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Dashboard Preview (Browser Window) */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateY: 10, rotateX: 5 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="relative perspective-1000"
                >
                    {/* The "Browser" Container */}
                    <div className="relative rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden transform transition-transform hover:scale-[1.01] duration-500 group">

                        {/* Browser Header */}
                        <div className="h-10 bg-slate-900/80 border-b border-slate-700/50 flex items-center px-4 gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="ml-4 flex-1 max-w-sm h-6 bg-slate-800/50 rounded-md flex items-center px-3 text-[10px] text-slate-500 font-mono">
                                chauncey.ai/dashboard
                            </div>
                        </div>

                        {/* Browser Content (Mock Dashboard) */}
                        <div className="p-6 bg-slate-950/80 grid gap-6 relative">
                            {/* Overlay Glow */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />

                            {/* Top Stats Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-slate-900/60 border-slate-800/60">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                            <Layout className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="text-slate-400 text-xs font-medium">Total Earnings</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-white font-mono">$998.95</span>
                                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20 mb-1">+37.8%</Badge>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-slate-900/60 border-slate-800/60">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                            <Smartphone className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <span className="text-slate-400 text-xs font-medium">Expenses</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-white font-mono">$250.80</span>
                                        <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20 mb-1">-25.6%</Badge>
                                    </div>
                                </Card>
                            </div>

                            {/* Main Chart Area Mockup */}
                            <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800/60 h-[220px] relative">
                                <div className="p-4 border-b border-slate-800/60 flex justify-between items-center">
                                    <h4 className="font-bold text-sm">Statistics</h4>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-[160px] w-full">
                                    {/* Abstract Chart Lines CSS */}
                                    <svg className="w-full h-full" preserveAspectRatio="none">
                                        <path d="M0,100 C50,80 100,120 150,60 C200,0 250,80 300,50 C350,20 400,90 450,70 L450,160 L0,160 Z" fill="url(#grad1)" fillOpacity="0.2" />
                                        <path d="M0,100 C50,80 100,120 150,60 C200,0 250,80 300,50 C350,20 400,90 450,70" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />

                                        <path d="M0,130 C60,140 120,90 180,110 C240,130 300,80 360,100 C420,120 480,90 540,110 L540,160 L0,160 Z" fill="url(#grad2)" fillOpacity="0.2" />
                                        <path d="M0,130 C60,140 120,90 180,110 C240,130 300,80 360,100" stroke="#a855f7" strokeWidth="3" fill="none" strokeLinecap="round" />

                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {/* Floating Tooltip Mock */}
                                    <div className="absolute top-[30%] left-[40%] bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-slate-700 animate-bounce">
                                        $4,200
                                    </div>
                                </div>
                            </Card>

                            {/* Search Bar & Nav Mockup (Replica of bottom right image section) */}
                            <div className="h-12 bg-slate-900/60 rounded-xl border border-slate-800/60 flex items-center px-4 justify-between">
                                <div className="flex items-center gap-2 text-slate-500 text-xs w-full">
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Search for leads...</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-blue-600/20 rounded-md" />
                                    <div className="h-6 w-6 bg-slate-700/50 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorative Blur behind the browser to make it pop */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-xl blur-2xl -z-10 opacity-50" />
                </motion.div>
            </div>

            {/* Trusted By Logos */}
            <div className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/50">
                <p className="text-center text-slate-500 text-sm mb-8 font-medium">TRUSTED BY FORWARD-THINKING BUSINESSES</p>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Using text for logos to avoid external image deps that break, styled to look like logos */}
                    <span className="text-2xl font-bold font-serif text-slate-300">Humana</span>
                    <span className="text-2xl font-black tracking-tighter text-slate-300">Jeep</span>
                    <span className="text-2xl font-bold text-slate-300">HOLOGIC</span>
                    <div className="flex items-center gap-1">
                        <Globe className="w-6 h-6 text-slate-300" />
                        <span className="text-2xl font-bold text-slate-300">bitcoin</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-300">HubSpot</span>
                    <span className="text-2xl font-bold text-slate-300 italic">stripe</span>
                </div>
            </div>
        </div>
    );
}
