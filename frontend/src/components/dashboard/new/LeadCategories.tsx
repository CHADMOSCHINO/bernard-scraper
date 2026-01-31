import { motion } from 'framer-motion';

const categories = [
    { name: 'Retail', count: 420, valid: 80 },
    { name: 'Tech', count: 350, valid: 65 },
    { name: 'Services', count: 210, valid: 40 },
    { name: 'Hospitality', count: 180, valid: 90 },
];

export function LeadCategories() {
    return (
        <div className="h-full flex flex-col justify-center space-y-4">
            {categories.map((cat, i) => (
                <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-300">{cat.name}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                            <span className="text-cyan-400">{cat.valid}% Valid</span>
                            <span>{cat.count} Total</span>
                        </div>
                    </div>
                    <div className="flex gap-1 h-2 items-center">
                        {/* Horizontal ellipse/bar distribution */}
                        {Array.from({ length: 15 }).map((_, idx) => {
                            const isActive = (idx / 15) * 100 < cat.valid;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 + idx * 0.02 }}
                                    className={`h-full rounded-full flex-1 ${isActive
                                            ? 'bg-cyan-500 shadow-[0_0_4px_rgba(34,211,238,0.5)]'
                                            : 'bg-slate-800'
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
