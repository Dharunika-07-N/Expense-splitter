import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from '../../ui/BaseUI';
import { TrendingUp, PieChart as PieIcon, Users, Receipt } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function GroupAnalytics({ expenses, members }) {
    const categoryData = useMemo(() => {
        const stats = {};
        expenses.forEach(e => {
            const cat = e.category || 'Other';
            stats[cat] = (stats[cat] || 0) + e.amount;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const memberData = useMemo(() => {
        const stats = {};
        members.forEach(m => {
            stats[m.name] = expenses
                .filter(e => e.payer === m.id)
                .reduce((sum, e) => sum + e.amount, 0);
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    }, [expenses, members]);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                    <div className="flex items-center gap-2 mb-6">
                        <PieIcon size={20} className="text-blue-500" />
                        <h4 className="font-black text-slate-900 tracking-tight">Category Breakdown</h4>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase truncate flex-1">{cat.name}</span>
                                <span className="text-[10px] font-black text-slate-900">₹{cat.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Member Contributions */}
                <Card>
                    <div className="flex items-center gap-2 mb-6">
                        <Users size={20} className="text-indigo-500" />
                        <h4 className="font-black text-slate-900 tracking-tight">Who Paid What</h4>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memberData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50/50 border-blue-100">
                    <TrendingUp className="text-blue-600 mb-2" size={24} />
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Average / Person</h5>
                    <p className="text-2xl font-black text-slate-900">₹{(totalSpent / (members.length || 1)).toLocaleString()}</p>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100">
                    <Receipt className="text-emerald-600 mb-2" size={24} />
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Total Expenses</h5>
                    <p className="text-2xl font-black text-slate-900">{expenses.length}</p>
                </Card>
            </div>
        </div>
    );
}
