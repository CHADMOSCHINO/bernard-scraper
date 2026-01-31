import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

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

export function Contact() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white font-sans overflow-x-hidden relative">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-50 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Bernard" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold">Bernard</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm text-slate-400">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
                    <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button>
                    <button className="text-white font-medium">Contact</button>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                    Dashboard
                </button>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-start">
                {/* Contact Form */}
                <motion.div custom={0} initial="hidden" animate="visible" variants={slipVariant}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                    <p className="text-slate-400 text-lg mb-8">
                        Have questions about our API, enterprise plans, or just want to say hi? We'd love to hear from you.
                    </p>

                    {status === 'success' ? (
                        <Card className="p-8 bg-green-500/10 border-green-500/30 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                                <Send className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-400 mb-2">Message Sent!</h3>
                            <p className="text-slate-300">We'll get back to you within 24 hours.</p>
                            <button onClick={() => setStatus('idle')} className="mt-6 text-sm underline text-slate-400 hover:text-white">Send another</button>
                        </Card>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Name</label>
                                    <input required type="text" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-slate-900" placeholder="Alex Morgan" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Email</label>
                                    <input required type="email" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-slate-900" placeholder="alex@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Subject</label>
                                <select className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                    <option>General Support</option>
                                    <option>Billing Question</option>
                                    <option>Enterprise Sales</option>
                                    <option>Bug Report</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Message</label>
                                <textarea required rows={5} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-slate-900 resize-none" placeholder="Tell us how we can help..." />
                            </div>
                            <button
                                disabled={status === 'submitting'}
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                {status === 'submitting' ? 'Sending...' : (
                                    <>Send Message <Send className="w-4 h-4 ml-1" /></>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Info & Map */}
                <motion.div custom={1} initial="hidden" animate="visible" variants={slipVariant} className="space-y-8">
                    <Card className="p-8 bg-slate-900/30 border-slate-800 overflow-hidden relative group">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-cyan-400" /> Our Office</h3>
                        <p className="text-slate-400 mb-6">
                            Based in the heart of Los Angeles, blending tech innovation with creative drive.
                        </p>

                        {/* Map Embed Mock */}
                        <div className="w-full h-[250px] bg-slate-800 rounded-lg overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423286.2739981845!2d-118.69191669477028!3d34.020161309395245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1645558913345!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0, opacity: 0.7 }}
                                allowFullScreen={false}
                                loading="lazy"
                            />
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-6 bg-slate-900/30 border-slate-800 hover:bg-slate-900/50 transition-colors cursor-pointer">
                            <Mail className="w-6 h-6 text-purple-400 mb-3" />
                            <h4 className="font-bold">Email Us</h4>
                            <p className="text-xs text-slate-500 mt-1">support@bernard.ai</p>
                        </Card>
                        <Card className="p-6 bg-slate-900/30 border-slate-800 hover:bg-slate-900/50 transition-colors cursor-pointer">
                            <MessageSquare className="w-6 h-6 text-pink-400 mb-3" />
                            <h4 className="font-bold">Live Chat</h4>
                            <p className="text-xs text-slate-500 mt-1">Available 9-5 PST</p>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
