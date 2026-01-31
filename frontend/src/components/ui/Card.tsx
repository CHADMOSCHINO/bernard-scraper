import { cn } from '@/lib/utils';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import type { MouseEvent } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: string;
    animate?: boolean;
    spotlight?: boolean;
}

export function Card({ children, className, gradient, animate = false, spotlight = true, ...props }: CardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        if (!spotlight) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const content = (
        <div
            className={cn(
                "rounded-[32px] p-6 shadow-lg border border-border/40 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-primary/20 backdrop-blur-sm group",
                gradient ? "text-white" : "bg-card/80 text-card-foreground",
                className
            )}
            style={gradient ? { background: gradient } : undefined}
            onMouseMove={handleMouseMove}
            {...props}
        >
            {spotlight && !gradient && (
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(14, 165, 233, 0.15),
                                transparent 80%
                            )
                        `,
                    }}
                />
            )}
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full"
            >
                {content}
            </motion.div>
        );
    }

    return content;
}
