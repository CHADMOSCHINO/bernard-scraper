import {
    Database,
    Rocket,
    Settings,
    Zap,
    LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

interface BernardDockProps {
    onOpenMissionControl?: () => void;
}

export function BernardDock({ onOpenMissionControl }: BernardDockProps) {
    const navigate = useNavigate();

    const data = [
        {
            title: 'Bernard',
            icon: (
                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-black text-white text-lg">
                    B
                </div>
            ),
            onClick: () => navigate('/landing'),
        },
        {
            title: 'Dashboard',
            icon: (
                <LayoutGrid className='h-full w-full text-white' />
            ),
            onClick: () => navigate('/dashboard'),
        },
        {
            title: 'Scrapers',
            icon: (
                <Database className='h-full w-full text-white' />
            ),
            onClick: () => navigate('/dashboard'),
        },
        {
            title: 'Mission Control',
            icon: (
                <Rocket className='h-full w-full text-cyan-400' />
            ),
            onClick: () => {
                if (onOpenMissionControl) {
                    onOpenMissionControl();
                }
            },
        },
        {
            title: 'Settings',
            icon: (
                <Settings className='h-full w-full text-white' />
            ),
            onClick: () => navigate('/settings'),
        },
        {
            title: 'AI Config',
            icon: (
                <Zap className='h-full w-full text-yellow-400' />
            ),
            onClick: () => navigate('/settings'),
        },
    ];

    return (
        <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]'>
            <Dock className='items-end pb-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/50'>
                {data.map((item, idx) => (
                    <DockItem
                        key={idx}
                        onClick={item.onClick}
                        className='aspect-square rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors'
                    >
                        <DockLabel>{item.title}</DockLabel>
                        <DockIcon>{item.icon}</DockIcon>
                    </DockItem>
                ))}
            </Dock>
        </div>
    );
}
