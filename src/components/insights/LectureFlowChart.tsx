import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '0m', engagement: 65 },
    { time: '5m', engagement: 75 },
    { time: '10m', engagement: 85 },
    { time: '15m', engagement: 70 },
    { time: '20m', engagement: 90 },
    { time: '25m', engagement: 85 },
    { time: '30m', engagement: 80 },
];

export function LectureFlowChart() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Lecture Flow Analysis</h3>
                <p className="text-sm text-gray-500">Student engagement timeline</p>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
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
                            cursor={{ stroke: '#2D3091', strokeWidth: 2 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="engagement"
                            stroke="#2D3091"
                            strokeWidth={3}
                            dot={{ fill: '#2D3091', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
