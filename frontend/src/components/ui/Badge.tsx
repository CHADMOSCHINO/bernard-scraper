import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost' | 'pill';
}

export function Badge({ children, className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        pill: "rounded-full px-4 py-1 flex items-center gap-2 shadow-sm font-medium bg-card text-card-foreground border border-border/50"
    }

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
