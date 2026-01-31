import { useState } from 'react';
import { Send, MessageSquare, Mail, Clock, Plus, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function Outreach() {
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

    const templates = [
        { id: 1, name: 'Payment Processor Pitch', type: 'email', subject: 'Saving on transaction fees?', lastUsed: '2h ago' },
        { id: 2, name: 'Quick Intro', type: 'sms', content: 'Hi, this is Chad from Chauncey...', lastUsed: '1d ago' },
        { id: 3, name: 'Follow Up #1', type: 'email', subject: 'Checking back on my proposal', lastUsed: '3d ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Outreach CRM</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage campaigns and communicate with leads.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Templates / Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <Card className="p-4 bg-slate-900/50 border-slate-800 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-sm">Templates & Scripts</h3>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'email' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800 text-slate-500'}`}
                                >
                                    <Mail className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('sms')}
                                    className={`p-2 rounded-lg transition-colors ${activeTab === 'sms' ? 'bg-green-500/20 text-green-400' : 'hover:bg-slate-800 text-slate-500'}`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {templates.filter(t => t.type === activeTab).map(template => (
                                <div key={template.id} className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 cursor-pointer transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-slate-200 text-sm">{template.name}</span>
                                        <MoreHorizontal className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {template.type === 'email' ? template.subject : template.content}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                                        <Clock className="w-3 h-3" /> Used {template.lastUsed}
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-xs font-medium hover:bg-slate-800/50 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-3 h-3" /> Create New Script
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Main Composer Area */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="p-6 bg-slate-900/50 border-slate-800 h-full min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/10">
                                    <Send className="w-4 h-4 text-blue-400 ml-0.5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">New Outreach Blast</h3>
                                    <p className="text-xs text-slate-400">Targeting: <span className="text-cyan-400">Web Design in Raleigh</span> (47 leads)</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject Line</label>
                                <input
                                    type="text"
                                    defaultValue="Are you overpaying for credit card processing?"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                                <div className="absolute right-3 top-[29px] text-[10px] text-green-400 font-bold bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/20">
                                    High Open Rate
                                </div>
                            </div>

                            <div className="h-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message Body</label>
                                <textarea
                                    className="w-full h-[300px] bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors resize-none leading-relaxed"
                                    defaultValue={`Hi {{Business_Name}},

I'm Chad, and I'm a local developer here in Raleigh.

I noticed you're doing great work, but I wanted to ask—are you happy with your current payment processor? Many local businesses are overpaying by 1-2% on every transaction.

I help businesses like yours switch to more modern, lower-fee processors. It takes about 15 minutes and usually saves $500+/month.

Open to a quick 5-min chat?

Best,
Chad`}
                                />
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center">
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                <span>3 variables detected</span>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                                    Save Draft
                                </button>
                                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all">
                                    <Send className="w-3.5 h-3.5" /> Send Blast
                                </button>
                            </div>
                        </div>

                    </Card>
                </div>
            </div>
        </div>
    );
}
