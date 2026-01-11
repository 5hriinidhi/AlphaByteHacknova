import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Programming', score: 95.4 },
    { name: 'Math Logic', score: 88.2 },
    { name: 'Visual Arts', score: 76.5 },
    { name: 'History', score: 65.0 },
];

export function TrendAnalysis() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Trend Analysis</h3>
                <p className="text-sm text-gray-500">Best performing lessons this week</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" barSize={30}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" fill="#2D3091" radius={[0, 4, 4, 0] as [number, number, number, number]} background={{ fill: '#F3F4F9' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
