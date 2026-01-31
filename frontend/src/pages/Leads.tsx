import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MoreHorizontal, Search, Filter, Phone, Globe, Star, MapPin } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { motion, type Variants } from 'framer-motion';
import { CloudSyncModal } from '@/components/dashboard/CloudSyncModal';
import { Cloud } from 'lucide-react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

export function Leads() {
    const { leads, loading } = useLeads();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    const filteredLeads = leads.filter(lead =>
        (lead.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-transparent">
            <DashboardHeader />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col gap-6 p-4 md:p-6 pt-0 pb-32 overflow-y-auto custom-scrollbar"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                            Leads Database
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage and export your scraped business data.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search businesses..."
                                className="w-full bg-slate-950/50 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsSyncModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-sm font-semibold text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all font-mono"
                        >
                            <Cloud className="w-4 h-4" /> Cloud Sync
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Cloud Sync Modal */}
                <CloudSyncModal
                    isOpen={isSyncModalOpen}
                    onClose={() => setIsSyncModalOpen(false)}
                    leads={filteredLeads}
                />

                {/* Leads Bento Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="animate-pulse">Fetching latest leads...</p>
                        </div>
                    ) : (
                        <>
                            {filteredLeads.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-border/30 rounded-2xl bg-slate-950/30">
                                    No leads found matching your search.
                                </div>
                            ) : (
                                filteredLeads.map(lead => (
                                    <motion.div key={lead.id} variants={cardVariants}>
                                        <Card className="group relative overflow-hidden border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all duration-300 p-0 shadow-lg shadow-black/20">
                                            <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Avatar / Icon */}
                                                <div className="flex items-center gap-3 min-w-[220px]">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-cyan-400 font-bold font-mono text-lg border border-slate-700 shadow-inner">
                                                        {lead.business_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-100 text-base truncate group-hover:text-cyan-400 transition-colors">{lead.business_name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex items-center gap-0.5">
                                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                <span className="text-xs font-mono font-medium text-slate-300">{lead.rating || 'N/A'}</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 font-mono border-l border-slate-700 pl-2">{lead.reviews || 0} reviews</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info Columns - Compact */}
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group/link cursor-pointer">
                                                            <div className="p-1 rounded bg-slate-800/50 group-hover/link:bg-slate-700"><Phone className="w-3 h-3" /></div>
                                                            <span className="truncate font-mono">{lead.phone}</span>
                                                        </div>
                                                    )}
                                                    {lead.address && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group/link cursor-pointer">
                                                            <div className="p-1 rounded bg-slate-800/50 group-hover/link:bg-slate-700"><MapPin className="w-3 h-3" /></div>
                                                            <span className="truncate max-w-[200px]">{lead.address}</span>
                                                        </div>
                                                    )}
                                                    {lead.website && (
                                                        <div className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors group/link">
                                                            <div className="p-1 rounded bg-blue-500/10 group-hover/link:bg-blue-500/20"><Globe className="w-3 h-3" /></div>
                                                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                                                Website
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 pl-0 md:pl-4 md:border-l md:border-slate-800/50">
                                                    <Badge variant="outline" className="md:hidden bg-slate-800/50 border-slate-700">New</Badge>
                                                    <div className="flex items-center gap-2">
                                                        <button className="px-3 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 border border-cyan-500/20 transition-all">
                                                            View
                                                        </button>
                                                        <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gradient Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
