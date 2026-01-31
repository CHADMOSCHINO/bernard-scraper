import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

interface BentoCardProps extends HTMLMotionProps<"div"> {
    title?: string;
    subtitle?: string;
    colSpan?: number;
    rowSpan?: number;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export function BentoCard({
    title,
    subtitle,
    colSpan = 1,
    rowSpan = 1,
    children,
    className,
    actions,
    ...props
}: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "bento-card spotlight-card flex flex-col p-5",
                colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
                colSpan === 3 ? "lg:col-span-3" : "",
                rowSpan === 2 ? "md:row-span-2" : "md:row-span-1",
                className
            )}
            {...props}
        >
            {(title || actions) && (
                <div className="flex justify-between items-start mb-4 relative z-20">
                    <div>
                        {title && <h3 className="text-sm font-bold text-[#F5F5F7] tracking-wide">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                    {(actions || title) && ( // Always show ellipsis if title exists for consistency or just if actions
                        <div className="flex items-center gap-2">
                            {actions}
                            <button className="text-slate-500 hover:text-white transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="flex-1 relative z-10 min-h-0">
                {children}
            </div>
        </motion.div>
    );
}
