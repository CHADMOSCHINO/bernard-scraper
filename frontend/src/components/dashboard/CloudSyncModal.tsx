import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Check, Loader2, Database, Globe, Link2, ExternalLink } from 'lucide-react';
import * as api from '@/lib/api';

interface CloudSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: any[];
}

interface Connector {
    service_id: string;
    is_active: boolean;
    updated_at: string;
}

export function CloudSyncModal({ isOpen, onClose, leads }: CloudSyncModalProps) {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchConnectors();
        }
    }, [isOpen]);

    const fetchConnectors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${api.API_URL}/api/connectors`);
            const data = await res.json();
            setConnectors(data.connectors || []);
            // Auto-select active ones
            setSelectedTargets(data.connectors.filter((c: any) => c.is_active).map((c: any) => c.service_id));
        } catch (error) {
            console.error('Failed to fetch connectors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (selectedTargets.length === 0) return;

        setSyncing(true);
        setResults(null);

        try {
            const res = await fetch(`${api.API_URL}/api/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targets: selectedTargets,
                    leads: leads
                })
            });
            const data = await res.json();
            setResults(data.results);
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Sync failed. Please check console.');
        } finally {
            setSyncing(false);
        }
    };

    const toggleTarget = (id: string) => {
        setSelectedTargets(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0A0C14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-inner">
                                <Cloud className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Cloud Sync Engine</h3>
                                <p className="text-xs text-slate-400">Pushing {leads.length} leads to connected nodes.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-sm text-slate-500 font-mono">Scanning available connectors...</p>
                            </div>
                        ) : results ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Sync Sequence Complete</p>
                                        <p className="text-[10px] opacity-80">All data packets successfully transmitted.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(results).map(([name, data]: [string, any]) => (
                                        <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize font-bold text-xs text-white">{name.replace('_', ' ')}</span>
                                                {data.error ? (
                                                    <span className="text-[10px] text-red-400">Error: {data.error}</span>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-400">Success: {data.success} leads pushed</span>
                                                )}
                                            </div>
                                            {data.url && (
                                                <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1">
                                                    View Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors mt-4"
                                >
                                    Dismiss Center
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-3">
                                    {connectors.length === 0 ? (
                                        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-2">No active connectors found.</p>
                                            <a href="/settings" className="text-xs text-blue-400 font-bold hover:underline">Setup Integrations →</a>
                                        </div>
                                    ) : (
                                        connectors.map(c => (
                                            <div
                                                key={c.service_id}
                                                onClick={() => toggleTarget(c.service_id)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedTargets.includes(c.service_id)
                                                        ? 'bg-blue-500/10 border-blue-500/50'
                                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedTargets.includes(c.service_id) ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                                                        {c.service_id === 'notion_v2' ? <Database className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white capitalize">{c.service_id.replace('_', ' ')}</p>
                                                        <p className="text-[10px] text-slate-500">Live Sync Ready</p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedTargets.includes(c.service_id)
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-white/20'
                                                    }`}>
                                                    {selectedTargets.includes(c.service_id) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={handleSync}
                                    disabled={selectedTargets.length === 0 || syncing}
                                    className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedTargets.length > 0 && !syncing
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed text-white'
                                        }`}
                                >
                                    {syncing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Encrypting & Transmitting...
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="w-4 h-4" />
                                            Initiate Cloud Sync Sequence
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-slate-600">
                                    Security Protocol: All data is transmitted over secure SSL tunnels.
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
