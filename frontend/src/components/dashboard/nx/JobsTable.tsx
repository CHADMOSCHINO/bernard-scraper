import { MoreHorizontal, Download, Filter, Search, Play, Pause, ExternalLink, Wrench, Briefcase, Home, Coffee, Rocket, Target, Lightbulb } from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '@/lib/api';

// Demo data removed - now using real system data only

interface Job {
    id: number;
    keyword: string;
    platform: string;
    progress: number;
    status: string;
    emails: number;
    date: string;
    avatar: ReactNode;
}

const filters = ['All', 'Running', 'Completed', 'Queued'];

export function JobsTable() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);

    // Fetch real runs from API
    useEffect(() => {
        const fetchRuns = async () => {
            try {
                const { runs } = await api.getRuns(20);
                if (runs && Array.isArray(runs)) {
                    const iconList = [
                        <Wrench className="w-4 h-4 text-blue-400" />,
                        <Briefcase className="w-4 h-4 text-cyan-400" />,
                        <Home className="w-4 h-4 text-emerald-400" />,
                        <Coffee className="w-4 h-4 text-orange-400" />,
                        <Rocket className="w-4 h-4 text-purple-400" />,
                        <Target className="w-4 h-4 text-rose-400" />,
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                    ];
                    const mappedJobs = runs.map((run: any, i: number) => ({
                        id: run.id,
                        keyword: `${run.niche} in ${run.city}, ${run.state}`,
                        platform: 'Google Maps',
                        progress: run.status === 'completed' ? 100 : run.status === 'running' ? 45 : 0,
                        status: run.status === 'completed' ? 'Completed' : run.status === 'running' ? 'Processing' : 'Pending',
                        emails: run.total_leads || 0,
                        date: new Date(run.started_at).toLocaleDateString(),
                        avatar: iconList[i % iconList.length]
                    }));
                    setJobs(mappedJobs);
                }
            } catch (error) {
                console.error('Failed to fetch real jobs:', error);
            }
        };
        fetchRuns();
        const interval = setInterval(fetchRuns, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' ||
            (activeFilter === 'Running' && (job.status === 'Processing' || job.status === 'Starting' || job.status === 'Enriching')) ||
            (activeFilter === 'Completed' && job.status === 'Completed');
        return matchesSearch && matchesFilter;
    });

    const handleExportCSV = async (id?: number) => {
        try {
            await api.exportLeadsCSV();
        } catch {
            const targetJobs = id ? jobs.filter(j => j.id === id) : jobs;
            const csvContent = "data:text/csv;charset=utf-8," +
                "Task,Platform,Status,Leads,Date\n" +
                targetJobs.map(job => `${job.keyword.replace(/,/g, '')},${job.platform},${job.status},${job.emails},${job.date}`).join("\n");
            const link = document.createElement("a");
            link.href = encodeURI(csvContent);
            link.download = `bernard_export_${new Date().getTime()}.csv`;
            link.click();
        }
    };

    const handleExportPDF = async (id?: number) => {
        alert('🎨 Generating Premium Intelligence Report...');
        setTimeout(() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const targetJobs = id ? jobs.filter(j => j.id === id) : jobs;
            const jobRows = targetJobs.map(j => `
                <tr style="border-bottom: 1px solid #1F2937">
                    <td style="padding: 12px">${j.id}</td>
                    <td style="padding: 12px"><strong>${j.keyword}</strong></td>
                    <td style="padding: 12px">${j.platform}</td>
                    <td style="padding: 12px">${j.emails}</td>
                    <td style="padding: 12px; color: ${j.status === 'Completed' ? '#10B981' : '#3B82F6'}">${j.status}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                <head>
                    <title>Bernard Intelligence Report</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; background: #0A0C14; color: white; padding: 40px; }
                        .header { border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 40px; }
                        table { width: 100%; border-collapse: collapse; }
                        th { text-align: left; padding: 12px; color: #64748B; text-transform: uppercase; font-size: 10px; }
                        .footer { margin-top: 50px; font-size: 10px; color: #475569; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>BERNARD INTELLIGENCE</h1>
                        <p>Automated Lead Extraction Report — Generated ${new Date().toLocaleString()}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Target / Niche</th>
                                <th>Source</th>
                                <th>Leads Found</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${jobRows}</tbody>
                    </table>
                    <div class="footer">
                        Confidential Intelligence Data • Powered by Bernard Neural Engine
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }, 1500);
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm">Active Jobs</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">
                        {jobs.filter(j => j.status !== 'Completed').length} Running
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Filters */}
                    <div className="hidden md:flex items-center gap-1 mr-2">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:border-blue-500/50 outline-none w-32 transition-all"
                        />
                    </div>

                    {/* Filter Button */}
                    <button className="p-1.5 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all">
                        <Filter className="w-3.5 h-3.5" />
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button
                            onClick={() => handleExportCSV()}
                            className="p-1.5 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 glass-card p-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 shadow-2xl">
                            <button
                                onClick={() => handleExportCSV()}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white rounded flex items-center gap-2 transition-colors"
                            >
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> CSV Dataset
                            </button>
                            <button
                                onClick={() => handleExportPDF()}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white rounded flex items-center gap-2 transition-colors"
                            >
                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" /> PDF Intelligence
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] text-[10px] uppercase text-slate-500 font-bold tracking-widest border-b border-white/5">
                            <th className="p-3 w-10 text-center">
                                <input type="checkbox" className="w-3 h-3 rounded bg-white/5 border-white/10 accent-blue-500" />
                            </th>
                            <th className="p-3">Task</th>
                            <th className="p-3 w-1/4">Progress</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Leads</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        <AnimatePresence>
                            {filteredJobs.map((job) => (
                                <motion.tr
                                    key={job.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="table-row border-b border-white/5 group cursor-pointer"
                                    onClick={() => setExpandedRow(expandedRow === job.id ? null : job.id)}
                                >
                                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="w-3 h-3 rounded bg-white/5 border-white/10 accent-blue-500" />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm">
                                                {job.avatar}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{job.keyword}</div>
                                                <div className="text-[10px] text-slate-600 flex items-center gap-1">
                                                    {job.platform} • {job.date}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="progress-bar">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${job.progress}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className={`progress-bar-fill ${job.progress < 100 ? 'in-progress' : ''}`}
                                            />
                                        </div>
                                        <div className="text-[9px] text-right mt-0.5 text-slate-600 font-mono">{job.progress}%</div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${job.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            job.status === 'Processing' || job.status === 'Enriching' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                'bg-slate-800 text-slate-500 border border-white/5'
                                            }`}>
                                            {job.status === 'Processing' && <span className="inline-block w-1 h-1 bg-orange-400 rounded-full mr-1 animate-pulse" />}
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-white font-mono font-bold">{job.emails.toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-600">leads</div>
                                    </td>
                                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {job.status !== 'Completed' ? (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try { await api.stopScrape(); } catch (err) { console.error(err); }
                                                    }}
                                                    className="p-1 text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                                                    title="Pause/Stop Scraper"
                                                >
                                                    <Pause className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try { await api.startScrape(); } catch (err) { console.error(err); }
                                                    }}
                                                    className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                                    title="Restart Job"
                                                >
                                                    <Play className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600">
                <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
                <div className="flex items-center gap-2">
                    <button className="px-2 py-1 hover:bg-white/5 rounded transition-colors">Previous</button>
                    <button className="px-2 py-1 bg-white/5 text-white rounded">1</button>
                    <button className="px-2 py-1 hover:bg-white/5 rounded transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}
