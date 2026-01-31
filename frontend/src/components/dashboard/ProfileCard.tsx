import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Users, MapPin, Trophy, RefreshCw } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { motion } from 'framer-motion';

export function ProfileCard() {
    const { stats } = useStats();

    return (
        <Card className="h-full flex flex-col items-center justify-center p-8 relative" animate>
            <button className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors hover:rotate-180 duration-500">
                <RefreshCw className="w-5 h-5" />
            </button>

            <div className="relative mb-6 group cursor-pointer">
                {/* Animated Ring */}
                <svg className="absolute -inset-4 w-[160px] h-[160px] rotate-[-90deg]" viewBox="0 0 100 100">
                    <motion.circle
                        cx="50" cy="50" r="48"
                        fill="none"
                        stroke="url(#gradientRing)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="w-32 h-32 rounded-full p-1 border-4 border-l-pink-400 border-t-pink-200 border-r-pink-200 border-b-pink-200 rotate-45 transition-transform duration-700 group-hover:rotate-[225deg]">
                    <div className="w-full h-full rounded-full bg-secondary overflow-hidden -rotate-45 transition-transform duration-700 group-hover:rotate-[-225deg]">
                        <img
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"
                            alt="Alex Rivera"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="absolute bottom-0 right-4 bg-card text-foreground p-1.5 rounded-full shadow-lg border border-border">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
            >
                <h2 className="text-xl font-bold text-foreground mb-1">Alex Rivera</h2>
                <p className="text-muted-foreground text-sm mb-8">Lead Generation Specialist</p>
            </motion.div>

            <div className="flex items-center gap-4 w-full justify-between px-4">
                {[
                    { icon: Users, val: stats?.totalLeads || 0, color: "text-blue-500" },
                    { icon: MapPin, val: stats?.runs || 0, color: "text-purple-500" },
                    { icon: Trophy, val: 12, color: "text-orange-500" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + (i * 0.1) }}
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    >
                        <Badge variant="pill" className="w-[80px] justify-center bg-slate-900/50 border-slate-800 backdrop-blur-md">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span>{item.val}</span>
                        </Badge>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
