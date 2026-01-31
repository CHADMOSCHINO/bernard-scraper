import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

const data = [
    { x: 10, y: 30, z: 200, name: 'Google Maps' },
    { x: 30, y: 200, z: 260, name: 'LinkedIn' },
    { x: 45, y: 100, z: 400, name: 'Twitter' },
    { x: 50, y: 20, z: 280, name: 'Facebook' },
    { x: 70, y: 150, z: 500, name: 'Instagram' },
    { x: 80, y: 60, z: 100, name: 'YellowPages' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF69B4', '#00BFFF'];

export function SourcesBreakdown() {
    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="x" name="Volume" hide />
                    <YAxis type="number" dataKey="y" name="Quality" hide />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Leads" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-[#1A1F2E] border border-white/10 p-2 rounded shadow-xl text-xs">
                                        <p className="font-bold text-white">{data.name}</p>
                                        <p className="text-slate-400">{data.z} Leads</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter name="Sources" data={data} fill="#8884d8">
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
