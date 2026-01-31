import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Map, ArrowUp } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export function Area() {
    const areas = [
        { name: 'Los Angeles, CA', leads: 1250, conversion: 12, trend: 'up' },
        { name: 'New York, NY', leads: 850, conversion: 9, trend: 'down' },
        { name: 'Miami, FL', leads: 430, conversion: 15, trend: 'up' },
    ];

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col gap-6 p-6 pb-32 overflow-y-auto custom-scrollbar"
            >
                <h2 className="text-2xl font-bold text-foreground">Developed Areas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map(area => (
                        <motion.div key={area.name} variants={itemVariants}>
                            <Card className="flex flex-col gap-4 p-6 hover:shadow-md transition-all cursor-pointer border border-border/40 backdrop-blur-sm bg-card/60">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <Map className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className={area.trend === 'up' ? 'text-green-500 text-sm font-bold flex items-center' : 'text-red-500 text-sm font-bold flex items-center'}>
                                        {area.trend === 'up' ? '+' : '-'}{area.conversion}%
                                        {area.trend === 'up' && <ArrowUp className="w-3 h-3 ml-1" />}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{area.name}</h3>
                                    <p className="text-muted-foreground">{area.leads} Leads Generated</p>
                                </div>

                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(area.conversion / 20) * 100}%` }} />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
