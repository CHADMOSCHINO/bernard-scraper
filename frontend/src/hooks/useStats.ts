import { useState, useEffect } from 'react';

export interface DashboardStats {
    totalLeads: number;
    runs: number;
    // Add other fields based on actual API response
}

export interface Run {
    id: number;
    created_at: string;
    city: string;
    niche: string;
    status: string;
}

export function useStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [runs, setRuns] = useState<Run[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, runsRes] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/runs')
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (runsRes.ok) {
                    const runsData = await runsRes.json();
                    setRuns(runsData.runs || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { stats, runs, loading };
}
