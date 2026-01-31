import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_URL } from '@/lib/api';

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    plan: string;
    avatar: string;
    ipProtection: boolean;
    phone?: string;
    company?: string;
    location?: string;
    bio?: string;
}

interface UserContextType {
    profile: UserProfile;
    updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

const defaultProfile: UserProfile = {
    name: 'Chad Moschino',
    email: 'chad@bernard.ai',
    role: 'Lead Architect',
    plan: 'Beta Participant',
    avatar: 'https://ui-avatars.com/api/?name=Chad+Moschino&background=0D8ABC&color=fff&size=256',
    ipProtection: true,
    phone: '+1 (555) 019-2834',
    company: 'Grellax Industries',
    location: 'San Francisco, CA',
    bio: 'Building the future of autonomous lead generation.'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    // Preferences State
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);

    // Load profile from server or localStorage
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const stored = localStorage.getItem('bernard_user');
                const initial = stored ? JSON.parse(stored) : defaultProfile;

                // Try to fetch from server if email is available
                if (initial.email) {
                    const res = await fetch(`${API_URL}/api/profile/${initial.email}`);
                    const data = await res.json();
                    if (data && !data.error) {
                        setProfile(data);
                        return;
                    }
                }
                setProfile(initial);
            } catch (error) {
                console.error('Failed to load profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('bernard_user', JSON.stringify(newProfile));

        // Sync with server
        try {
            await fetch(`${API_URL}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProfile)
            });
        } catch (error) {
            console.error('Failed to sync profile with server:', error);
        }
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
