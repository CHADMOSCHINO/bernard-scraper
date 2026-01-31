import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already authenticated
        if (localStorage.getItem('chauncey_auth') === 'true') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, verify against a secure backend hash. 
        // For this local tool, we match the generated key.
        // Ideally this comes from an env var, but for this standalone request we'll hardcode the one we just generated 
        // or provide a simple check.
        // The user has the key in chauncey-key.txt. 
        // I will hardcode the check against the one I just generated for simplicity in this artifact.

        if (password === 'chauncey-0cd944fe') {
            localStorage.setItem('chauncey_auth', 'true');
            navigate('/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center mb-4 shadow-lg">
                            <img src="/src/assets/chauncey_logo.png" className="w-10 h-10 object-contain" alt="Logo" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Chauncey Security</h1>
                        <p className="text-slate-500 text-sm mt-2">Enter your access key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full bg-slate-950/50 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500/50'} rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all`}
                                    placeholder="Access Key..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Authenticate
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>Invalid Access Key</span>
                        </motion.div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
                            Protected System • Auth Required
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
