import { useState, useEffect } from 'react';
import * as api from '@/lib/api';

interface FeedItem {
    type: string;
    text: string;
    time: string;
    data?: any;
}

export function LiveFeed() {
    const [liveFeed, setLiveFeed] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { feed } = await api.getLiveFeed();
                if (feed) setLiveFeed(feed);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch feed:', error);
            }
        };

        fetchFeed();
        const interval = setInterval(fetchFeed, 3000); // Poll every 3s for "live" feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Feed</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-mono font-bold tracking-tighter">{isLoading ? 'READY' : 'ONLINE'}</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {(liveFeed.length > 0 ? liveFeed : [
                    { text: 'Awaiting neural command...', time: 'now', type: 'info' },
                ]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0 hover:bg-white/5 transition-colors px-1 rounded">
                        <span className={`text-[11px] font-medium leading-tight ${item.type === 'lead' ? 'text-emerald-400' : item.type === 'run' ? 'text-blue-400' : 'text-slate-400'}`}>
                            {item.text}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono flex-shrink-0 ml-2">
                            {item.time && item.time !== 'now' ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
