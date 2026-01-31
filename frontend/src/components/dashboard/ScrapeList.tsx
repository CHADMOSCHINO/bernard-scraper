import { MapPin, ArrowRight, Video, Mail, Building, Loader2 } from 'lucide-react';
import { useStats } from '@/hooks/useStats';



export function ScrapeList() {
    const { runs, loading } = useStats();

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()
        };
    };

    // Helper to get icon and color based on niche
    const getRunStyles = (niche: string) => {
        const lowerNiche = niche?.toLowerCase() || '';
        if (lowerNiche.includes('tech') || lowerNiche.includes('startup')) return { icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (lowerNiche.includes('retail') || lowerNiche.includes('shop')) return { icon: MapPin, color: 'text-green-500', bg: 'bg-green-500/10' };
        if (lowerNiche.includes('restaurant') || lowerNiche.includes('food')) return { icon: Building, color: 'text-orange-500', bg: 'bg-orange-500/10' };
        return { icon: Mail, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">My Scrapes</h3>
                <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-secondary border border-border shadow-sm transition-colors">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : runs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No recent scrapes found.</div>
                ) : (
                    runs.slice(0, 5).map((run) => {
                        const { date, time } = formatDate(run.created_at || new Date().toISOString());
                        const styles = getRunStyles(run.niche);

                        return (
                            <div key={run.id} className="group flex items-center justify-between p-4 bg-card rounded-2xl hover:shadow-md transition-all cursor-pointer border border-border/50">
                                <div className="flex items-start gap-4">
                                    <div className="min-w-[80px]">
                                        <p className="text-xs font-semibold text-muted-foreground">{date}</p>
                                        <p className="text-sm font-bold text-foreground">{time}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.bg} ${styles.color}`}>
                                            <styles.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">{run.niche || 'General Search'}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{run.city}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-8 h-8 flex items-center justify-center rounded-full border border-transparent group-hover:border-border transition-colors">
                                    <ArrowRight className="w-4 h-4 text-muted-foreground -rotate-45 group-hover:text-foreground group-hover:rotate-0 transition-all duration-300" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="flex items-center gap-2 text-muted-foreground text-sm font-medium mt-6 hover:text-foreground transition-colors group">
                See all scrapes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
