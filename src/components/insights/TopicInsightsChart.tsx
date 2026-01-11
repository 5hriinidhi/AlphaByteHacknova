import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Listening', score: 85 },
    { name: 'Speaking', score: 60 },
    { name: 'Reading', score: 75 },
    { name: 'Writing', score: 50 },
];

export function TopicInsightsChart() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Topic Insights</h3>
                <p className="text-sm text-gray-500">Activity performance breakdown</p>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" fill="#9333ea" radius={[4, 4, 0, 0] as [number, number, number, number]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
