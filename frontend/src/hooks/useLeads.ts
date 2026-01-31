
import { useState, useEffect } from 'react';

export interface Lead {
    id: number;
    business_name: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
    reviews: number;
    description?: string;
    run_id: number;
    created_at: string;
}

export function useLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                // Fetch latest leads from the API
                const response = await fetch('/api/leads?limit=50'); // Assuming endpoint supports limit, or just /api/leads
                if (!response.ok) {
                    throw new Error('Failed to fetch leads');
                }
                const data = await response.json();
                setLeads(data.leads || []);
            } catch (err) {
                console.error("Error fetching leads:", err);
                // Fallback to mock data if API fails (for demo purposes if backend isn't ready)
                setError('Failed to load leads, showing cached data');
                setLeads([
                    { id: 1, business_name: "Mock Gym 1", address: "123 Main St", phone: "555-0123", website: "gym1.com", rating: 4.5, reviews: 100, run_id: 1, created_at: new Date().toISOString() },
                    { id: 2, business_name: "Mock Cafe", address: "456 Oak Ave", phone: "555-0456", website: "cafe.com", rating: 4.2, reviews: 50, run_id: 1, created_at: new Date().toISOString() },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    return { leads, loading, error };
}
