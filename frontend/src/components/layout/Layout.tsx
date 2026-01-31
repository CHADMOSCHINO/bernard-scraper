import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="h-full w-full bg-[#050608] text-foreground font-sans overflow-hidden flex flex-col">
            {/* Background Layers */}
            <div className="fixed inset-0 bg-[#050608] -z-30" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(59,130,246,0.15),transparent)] pointer-events-none -z-10 dark:opacity-100 opacity-40" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay -z-10" />

            <main className="flex-1 w-full relative z-10 flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
