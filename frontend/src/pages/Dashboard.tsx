import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/nx/Sidebar';
import { NXHeader } from '@/components/dashboard/nx/NXHeader';
import { MetricCounter } from '@/components/dashboard/nx/MetricCounter';
import { WorldMap } from '@/components/dashboard/nx/WorldMap';
import { JobsTable } from '@/components/dashboard/nx/JobsTable';
import { ScraperView } from '@/components/dashboard/nx/ScraperView';
import { MissionControl } from '@/components/dashboard/MissionControl';
import { BernardDock } from '@/components/dashboard/BernardDock';
import { Plus, X, Sparkles, Phone, ExternalLink, Key, TrendingUp, Zap, Activity, Clock, Download, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveFeed } from '@/components/dashboard/LiveFeed';
import * as api from '@/lib/api';

// Types
interface Stats {
  totalLeads: number;
  totalRuns: number;
  activeJobs: number;
  successRate: number;
  leadsLast24h: number;
  latestRun: any;
}

export function Dashboard() {
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real data state
  // Real data state
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalRuns: 0,
    activeJobs: 0,
    successRate: 100,
    leadsLast24h: 0,
    latestRun: null
  });

  // Fetch real data on mount
  const fetchData = async () => {
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('bernard_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('bernard_welcome_seen', 'true');
  };

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-full w-full bg-transparent text-white overflow-hidden">
      {/* Animated Beta Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 py-1">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-6 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> BETA — FREE UNTIL LAUNCH
                <span className="mx-3 opacity-50">•</span>
                <Rocket className="w-3 h-3" /> Subscribe for exclusive discounts
                <span className="mx-3 opacity-50">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-[101] lg:relative lg:z-0 lg:block pt-6 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <Sidebar onSelectView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} />
      </motion.div>

      <div className="flex-1 flex flex-col min-w-0 pt-6">
        {/* Header - Pass toggle to open sidebar on mobile */}
        <NXHeader onMenuToggle={toggleSidebar} />

        {/* Main Content - Tight Bento Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 lg:p-4 pb-32 bg-transparent">

          {currentView ? (
            <ScraperView platform={currentView} />
          ) : (
            <div className="grid grid-cols-12 gap-2 lg:gap-3 w-full items-stretch">

              {/* Hero Title - Spans full width */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-12 mb-2 px-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight-premium text-gradient-premium">
                      Lead Command Center
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5 uppercase tracking-widest font-bold">Real-time intelligence • Engine Active</p>
                  </div>
                </div>
              </motion.div>

              {/* Row 1: 4 Metric Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="col-span-12 sm:col-span-6 lg:col-span-3"
              >
                <MetricCounter
                  label="Leads Scraped"
                  value={formatNumber(stats.totalLeads)}
                  trend={stats.leadsLast24h > 0 ? "up" : "down"}
                  trendValue={stats.leadsLast24h > 0 ? `+${stats.leadsLast24h}` : "0"}
                  subValue="Last 24 Hours"
                  color="cyan"
                  icon={<TrendingUp className="w-4 h-4" />}
                  sparklineData={[30, 45, 35, 50, 40, 60, 55, stats.leadsLast24h]}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-12 sm:col-span-6 lg:col-span-3"
              >
                <MetricCounter
                  label="Success Rate"
                  value={`${stats.successRate}%`}
                  trend={stats.successRate >= 90 ? "up" : "down"}
                  trendValue={stats.successRate >= 90 ? "Optimal" : "Check Logs"}
                  subValue={`${stats.totalRuns} Total Runs`}
                  color="blue"
                  icon={<Zap className="w-4 h-4" />}
                  sparklineData={[90, 95, 88, 100, 92, 98, 95, stats.successRate]}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="col-span-12 sm:col-span-6 lg:col-span-3"
              >
                <MetricCounter
                  label="Active Jobs"
                  value={stats.activeJobs}
                  trend={stats.activeJobs > 0 ? "up" : "down"}
                  trendValue={stats.activeJobs > 0 ? "In Progress" : "Idle"}
                  subValue="System Scanner"
                  color="pink"
                  icon={<Activity className="w-4 h-4" />}
                  sparklineData={[0, 1, 0, 2, 1, 3, stats.activeJobs, stats.activeJobs]}
                  isLive={stats.activeJobs > 0}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-12 sm:col-span-6 lg:col-span-3"
              >
                <MetricCounter
                  label="Available Credits"
                  value="Unlimited"
                  trend="up"
                  trendValue="Active"
                  subValue="Beta Access"
                  color="green"
                  icon={<Clock className="w-4 h-4" />}
                  sparklineData={[100, 100, 100, 100, 100, 100, 100, 100]}
                />
              </motion.div>

              {/* Row 2: World Map - Large */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="col-span-12 lg:col-span-8 h-[320px] lg:h-[420px]"
              >
                <WorldMap />
              </motion.div>

              {/* Row 2: Side Panel - Quick Actions + Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-12 lg:col-span-4 flex flex-col gap-2 lg:gap-3"
              >
                {/* Quick Actions */}
                <div className="glass-card p-4 lg:p-5">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Neural Command</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsMissionControlOpen(true)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-400 hover:from-blue-600/30 hover:to-cyan-500/30 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" /> New Task
                    </button>
                    <button
                      onClick={() => api.exportLeadsCSV()}
                      className="w-full py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Data Export
                    </button>
                  </div>
                </div>

                {/* Live Feed */}
                <div className="flex-1 min-h-[150px]">
                  <LiveFeed />
                </div>
              </motion.div>

              {/* Row 3: Jobs Table - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="col-span-12"
              >
                <JobsTable />
              </motion.div>

            </div>
          )}

        </div>
      </div>

      {/* Mission Control Modal */}
      <MissionControl isOpen={isMissionControlOpen} onClose={() => setIsMissionControlOpen(false)} />

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMissionControlOpen(true)}
        className="fixed bottom-32 right-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg glow-blue z-50 lg:bottom-24"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <BernardDock onOpenMissionControl={() => setIsMissionControlOpen(true)} />
      </div>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4"
            onClick={handleCloseWelcome}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-card p-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

              <button
                onClick={handleCloseWelcome}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center glow-blue">
                    <span className="text-xl font-black text-white">B</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Welcome to Bernard.ai</h2>
                    <p className="text-xs text-cyan-400 font-medium">#1 Lead Scraper</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Experience <strong className="text-white">Google Maps mode</strong> with phone extraction and AI-powered lead scoring.
                </p>

                <div className="space-y-2 mb-4">
                  {[
                    { icon: Phone, label: 'Phone Extraction', desc: 'Verified business numbers' },
                    { icon: ExternalLink, label: 'OpenMap Integration', desc: 'View exact locations' },
                    { icon: Key, label: 'AI-Powered', desc: 'Gemini 2.0 integration' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <item.icon className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCloseWelcome}
                  className="w-full py-2.5 btn-premium text-white font-bold rounded-lg"
                >
                  Start Scraping →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
