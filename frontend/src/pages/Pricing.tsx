import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { BetaBanner } from '@/components/common/BetaBanner';

const slipVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as const
        }
    })
};

export function Pricing() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = (tier: string) => {
        setLoading(tier);
        // Simulator Stripe Checkout
        setTimeout(() => {
            alert(`Redirecting to Stripe Checkout for ${tier} tier... (Test Mode)`);
            setLoading(null);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white font-sans overflow-x-hidden relative">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px]" />
            </div>

            <BetaBanner />

            {/* Nav */}
            <nav className="relative z-50 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Bernard" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold">Bernard</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm text-slate-400">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
                    <button className="text-white font-medium">Pricing</button>
                    <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                    Dashboard
                </button>
            </nav>

            {/* Hero */}
            <div className="relative z-10 text-center pt-16 pb-20 px-4">
                <motion.h1
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={slipVariant}
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                >
                    Unlock Premium Leads<br />with Bernard
                </motion.h1>
                <motion.p
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={slipVariant}
                    className="text-lg text-slate-400 max-w-2xl mx-auto mb-12"
                >
                    Choose the plan that fits your growth. From casual prospecting to enterprise-grade automation.
                </motion.p>

                {/* Pricing Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Free Tier */}
                    <motion.div custom={2} initial="hidden" animate="visible" variants={slipVariant}>
                        <Card className="h-full p-8 flex flex-col bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-2">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 w-fit">Beta Access</h3>
                                <div className="text-4xl font-bold mt-4 font-mono">$0<span className="text-lg text-slate-500 font-sans font-normal">/mo</span></div>
                                <p className="text-sm text-slate-500 mt-2">Perfect for trying out Bernard.</p>
                            </div>
                            <div className="space-y-4 flex-1">
                                {['50 Leads per Scrape', 'Standard Support', 'Google Maps Integration', 'Dashboard Access', 'Export to CSV'].map(feat => (
                                    <div key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="p-1 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" /></div>
                                        {feat}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                            >
                                Get Started Free
                            </button>
                        </Card>
                    </motion.div>

                    {/* Pro Tier */}
                    <motion.div custom={3} initial="hidden" animate="visible" variants={slipVariant}>
                        <Card className="h-full p-8 flex flex-col relative bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-md border-blue-500/50 shadow-2xl shadow-blue-500/10 hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute top-4 right-4"><Badge className="bg-blue-500 text-white hover:bg-blue-600">Most Popular</Badge></div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Pro</h3>
                                <div className="text-4xl font-bold mt-4 font-mono">$29<span className="text-lg text-slate-500 font-sans font-normal">/mo</span></div>
                                <p className="text-sm text-slate-500 mt-2">For serious lead generation.</p>
                            </div>
                            <div className="space-y-4 flex-1">
                                {['Unlimited Leads', 'Priority Support', 'Gemini 3 Pro AI Filters', 'Real-time Integrations', 'Export to CRM (Notion/HubSpot)', 'Advanced Analytics'].map(feat => (
                                    <div key={feat} className="flex items-center gap-3 text-sm text-white">
                                        <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400"><Check className="w-3 h-3" /></div>
                                        {feat}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => handleSubscribe('Pro')}
                                disabled={loading === 'Pro'}
                                className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                {loading === 'Pro' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Subscribe Now <Zap className="w-4 h-4" /></>
                                )}
                            </button>
                        </Card>
                    </motion.div>

                    {/* Enterprise Tier */}
                    <motion.div custom={4} initial="hidden" animate="visible" variants={slipVariant}>
                        <Card className="h-full p-8 flex flex-col bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-purple-500/30 transition-all duration-300 group hover:-translate-y-2">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-300">Enterprise</h3>
                                <div className="text-4xl font-bold mt-4 font-mono">Custom</div>
                                <p className="text-sm text-slate-500 mt-2">For teams & high volume.</p>
                            </div>
                            <div className="space-y-4 flex-1">
                                {['Everything in Pro', 'Dedicated Scraping Servers', 'Custom API Access', 'SSO & Role Management', 'White-glove Onboarding', 'SLA Guarantee'].map(feat => (
                                    <div key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="p-1 rounded-full bg-purple-500/20 text-purple-400"><Check className="w-3 h-3" /></div>
                                        {feat}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/contact')}
                                className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                            >
                                Contact Sales <Lock className="w-4 h-4" />
                            </button>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-6 pb-32">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="grid gap-6">
                    {[
                        { q: "Is the beta really free?", a: "Yes! During our public beta (v1.1), all features in the Free tier are available at no cost. Pro features are simulated or coming soon." },
                        { q: "How does the Stripe integration work?", a: "We use Stripe for secure payments. In this demo environment, payments are in 'Test Mode' so you can simulate upgrades without being charged." },
                        { q: "Can I cancel anytime?", a: "Absolutely. Subscriptions are billed monthly and you can cancel from your dashboard settings instantly." }
                    ].map((faq, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                            <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                            <p className="text-slate-400">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
